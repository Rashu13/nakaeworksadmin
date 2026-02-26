import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, RefreshCw, DollarSign, Percent, Mail, Phone, Clock } from 'lucide-react';

const SystemSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await api.settings.getAll();
            setSettings(data);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to fetch settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, value) => {
        try {
            setSaving(true);
            const settingToUpdate = settings.find(s => s.key === key);
            if (!settingToUpdate) return;

            await api.settings.update(key, { ...settingToUpdate, value: value.toString() });

            // Update local state
            setSettings(settings.map(s => s.key === key ? { ...s, value: value.toString() } : s));
            setMessage({ type: 'success', text: 'Setting updated successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update setting' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const getIcon = (key) => {
        if (key.includes('fee')) return <DollarSign size={20} />;
        if (key.includes('percentage') || key.includes('tax')) return <Percent size={20} />;
        if (key.includes('email')) return <Mail size={20} />;
        if (key.includes('phone')) return <Phone size={20} />;
        if (key.includes('time')) return <Clock size={20} />;
        return <Settings size={20} />;
    };

    const getLabel = (key) => {
        switch (key) {
            case 'platform_fee': return 'Platform Fee (Fixed Amount)';
            case 'tax_percentage': return 'Tax Percentage (GST)';
            case 'support_email': return 'Support Email Address';
            case 'support_phone': return 'Support Phone Number';
            case 'work_time': return 'Official Working Hours';
            default: return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System & Contact Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global application business & contact configuration.</p>
                </div>
                <button
                    onClick={fetchSettings}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Settings size={20} />
                        Global Configuration
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading settings...</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {settings.map((setting) => (
                            <div key={setting.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 text-slate-900 rounded-xl mt-1 shrink-0">
                                        {getIcon(setting.key)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{getLabel(setting.key)}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description || 'Global configuration value'}</p>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono">Key: {setting.key}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full xl:w-1/2">
                                    <div className="relative w-full">
                                        <input
                                            type={setting.key.includes('fee') || setting.key.includes('percentage') ? "number" : "text"}
                                            defaultValue={setting.value}
                                            onBlur={(e) => {
                                                if (e.target.value !== setting.value) {
                                                    handleUpdate(setting.key, e.target.value);
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-900 outline-none transition-all"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none">
                                            {setting.key.includes('percentage') ? '%' : ''}
                                        </div>
                                    </div>
                                    <button
                                        disabled={saving}
                                        className="p-2 shrink-0 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Changes are saved automatically on blur"
                                    >
                                        <Save size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {settings.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No settings found. Run the database seeder to initialize settings.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemSettings;
