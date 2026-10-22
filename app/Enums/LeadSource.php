<?php

namespace App\Enums;

enum LeadSource: string
{
    case Website = 'website';
    case Referral = 'referral';
    case LinkedIn = 'linkedin';
    case ColdOutreach = 'cold_outreach';
    case GoogleAds = 'google_ads';
    case SocialMedia = 'social_media';
    case Event = 'event';
    case Other = 'other';

    /**
     * Get a human-readable label for the source.
     */
    public function label(): string
    {
        return match ($this) {
            self::Website => 'Website Inquiry',
            self::Referral => 'Client Referral',
            self::LinkedIn => 'LinkedIn',
            self::ColdOutreach => 'Cold Outreach',
            self::GoogleAds => 'Google Ads',
            self::SocialMedia => 'Social Media',
            self::Event => 'Event / Conference',
            self::Other => 'Other',
        };
    }
}
