-- SQL Script to sync categories from nakaeworks.com
INSERT INTO categories (
        "Id",
        "Name",
        "Slug",
        "Icon",
        "Description",
        "Status",
        "CreatedAt",
        "UpdatedAt"
    )
VALUES (
        89,
        'Lights Installation',
        'lights-installation',
        '1449387680.jpg',
        'Lights Installation services',
        true,
        NOW(),
        NOW()
    ),
    (
        88,
        'CCTV Camera',
        'cctv-camera',
        '',
        'CCTV Camera services',
        true,
        NOW(),
        NOW()
    ),
    (
        86,
        'Geyser',
        'geyser',
        '1354207315.webp',
        'Geyser services',
        true,
        NOW(),
        NOW()
    ),
    (
        85,
        'Switch Board/Socket',
        'switch-board-socket',
        '100438548.jpg',
        'Switch Board/Socket services',
        true,
        NOW(),
        NOW()
    ),
    (
        84,
        'Inverter/Stabilizer',
        'inverter-stabilizer',
        '57715297.webp',
        'Inverter/Stabilizer services',
        true,
        NOW(),
        NOW()
    ),
    (
        83,
        'Electrical Work',
        'electrical-work',
        '120761674.webp',
        'Electrical Work services',
        true,
        NOW(),
        NOW()
    ),
    (
        82,
        'Fan',
        'fan',
        '1792315823.webp',
        'Fan services',
        true,
        NOW(),
        NOW()
    ),
    (
        81,
        'Water Purifier',
        'water-purifier',
        '666530165.webp',
        'Water Purifier services',
        true,
        NOW(),
        NOW()
    ),
    (
        80,
        'Washing machine',
        'washing-machine',
        '1058593927.webp',
        'Washing machine services',
        true,
        NOW(),
        NOW()
    ),
    (
        79,
        'Refrigerator',
        'refrigerator',
        '1440203554.jpg',
        'Refrigerator services',
        true,
        NOW(),
        NOW()
    ),
    (
        77,
        'AC Service & Repair',
        'ac-service-repair',
        '81132951.jpg',
        'AC Service & Repair services',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT ("Id") DO
UPDATE
SET "Name" = EXCLUDED."Name",
    "Slug" = EXCLUDED."Slug",
    "Icon" = EXCLUDED."Icon",
    "UpdatedAt" = NOW();