import React from 'react';
import { X, LogOut, AlertCircle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "Do you really want to perform this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // danger, warning, info
    icon = null
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        if (icon) return icon;
        return <LogOut className="text-gray-500 dark:text-gray-400 rotate-180" size={24} />;
    };

    const getButtonColor = () => {
        if (type === 'danger') return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl transform transition-all scale-100 opacity-100 overflow-hidden">
                {/* Header / Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-700 dark:text-gray-300 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Icon Circle */}
                        <div className="mb-4 text-gray-700 dark:text-gray-700 dark:text-gray-300">
                            {getIcon()}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {title}
                        </h3>

                        {/* Message */}
                        {message && (
                            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 text-sm">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        {cancelText && (
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-100 dark:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-2.5 px-4 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
