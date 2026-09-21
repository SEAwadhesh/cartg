import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';

export const SEOHelmet: React.FC = () => {
  const { businessInfo, settings } = useData();

  useEffect(() => {
    // 1. Dynamic document title
    document.title = settings.seoTitle || `${businessInfo.name} - ${businessInfo.category}`;

    // 2. Helper to set or create meta tag
    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', nameOrProperty);
        } else {
          el.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', settings.seoDescription);
    setMeta('keywords', settings.seoKeywords);
    setMeta('og:title', settings.seoTitle, true);
    setMeta('og:description', settings.seoDescription, true);
    setMeta('og:image', settings.ogImageUrl || settings.heroImageUrl, true);
    setMeta('og:url', settings.canonicalUrl, true);
    setMeta('twitter:title', settings.seoTitle);
    setMeta('twitter:description', settings.seoDescription);
    setMeta('twitter:image', settings.ogImageUrl || settings.heroImageUrl);

    // 3. LocalBusiness JSON-LD Schema
    const structuredDataId = 'local-business-jsonld';
    let scriptTag = document.getElementById(structuredDataId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = structuredDataId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const openingHoursSpec = businessInfo.openingHours
      .filter((h) => h.isOpen)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: h.openTime,
        closes: h.closeTime
      }));

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: businessInfo.name,
      image: [businessInfo.logoUrl || settings.heroImageUrl, settings.ogImageUrl],
      '@id': settings.canonicalUrl,
      url: settings.canonicalUrl,
      telephone: businessInfo.phone,
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: businessInfo.address,
        addressLocality: businessInfo.locality,
        addressRegion: businessInfo.state,
        postalCode: businessInfo.postalCode,
        addressCountry: businessInfo.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 12.9121,
        longitude: 77.6446
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: businessInfo.rating.toString(),
        reviewCount: businessInfo.reviewCount.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      openingHoursSpecification: openingHoursSpec,
      sameAs: [
        settings.socialLinks.facebook,
        settings.socialLinks.instagram,
        settings.socialLinks.twitter,
        settings.socialLinks.linkedin,
        businessInfo.mapsUrl
      ].filter(Boolean)
    };

    scriptTag.text = JSON.stringify(schemaData);
  }, [businessInfo, settings]);

  return null;
};
