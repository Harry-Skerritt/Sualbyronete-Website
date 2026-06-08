// src/config/siteSettings.ts

// --- Essentials ---
export const baseURL = import.meta.env.BASE_URL.replace(/\/$/, '');

// --- Head Names ---
export const SITE_NAME = "Sualbyronete";
export const ADMIN_SITE_NAME = "Admin Dashboard";

// --- Breeder Info ---
export const BREEDER_NAME = "Susan Francis";
export const BREEDER_NAME_SHORT = "Sue";
export const BREEDER_IMAGE = {
    "src": "images/susan.jpg",
    "alt": "Susan Francis"
};

// --- Contact Details ---
export const CONTACT_NUMBER = "07701043475";
export const INSTAGRAM_LINK = "https://www.instagram.com/suefrancis55/";
export const FACEBOOK_LINK = "https://facebook.com/susan.francis.3158";
export const WHATSAPP_LINK = "https://wa.me/447701043475?text=Hi%20Sue,%20I%20saw%20your%20website%20and%20wanted%20to%20reach%20out!";
export const MESSENGER_LINK = "https://m.me/susan.francis.3158";


// --- Puppy Info ---
export const RESERVATION_COST = "£100";
export const RESERVATION_LENGTH = "10 Days";

export const PUPPY_INCLUSIONS = [
    "Pedigree",
    "Vaccinations",
    "Health Record",
    "Microchipped",
    "Insured",
    "Socialised with other dogs",
    {
        "title": "Puppy Pack Including:",
        "subItems": [
            "Owners Contract",
            "Feeding Instructions",
            "History from Birth to when they join your family"
        ]
    }
];

// --- About Section ---
export const HOME_PAGE_ABOUT = " " +
    "I have bred Yorkshire Terriers for over 30 years, and my journey began with my first beloved pet, Zoey.\n" +
    "My love for the breed grew with Xena and Zara, whose puppies made it even stronger.\n" +
    "After losing them, I became interested in showing Yorkshire Terriers and was proud to own successful dogs such as Bella and Byron, who qualified for Crufts for life.\n" +
    "Grace, Byron’s daughter, has always held a special place in my heart and remains part of my logo.\n" +
    "I later discovered a passion for Biewer Terriers, and today I continue breeding both with dedication, care, and high standards";

export const ABOUT_SECTIONS = [
    {
        title: "",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla sagittis dolor, eu blandit arcu volutpat ut. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam id nulla non diam tincidunt maximus vitae a dui. Donec tempor enim purus, vel condimentum lorem ultrices nec. Donec auctor tortor lacus, eu auctor risus tempor in. Phasellus quis erat nec diam ornare feugiat sit amet non turpis. Curabitur aliquam lectus ut odio commodo, et hendrerit lorem rutrum. Donec elementum egestas diam et tincidunt. Proin tempus urna at vehicula lacinia."
    },
    {
        title: "How I Got Into Dog Breeding",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla sagittis dolor, eu blandit arcu volutpat ut. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam id nulla non diam tincidunt maximus vitae a dui. Donec tempor enim purus, vel condimentum lorem ultrices nec. Donec auctor tortor lacus, eu auctor risus tempor in. Phasellus quis erat nec diam ornare feugiat sit amet non turpis. Curabitur aliquam lectus ut odio commodo, et hendrerit lorem rutrum. Donec elementum egestas diam et tincidunt. Proin tempus urna at vehicula lacinia."
    },
    {
        title: "A Bit About Me",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla sagittis dolor, eu blandit arcu volutpat ut. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam id nulla non diam tincidunt maximus vitae a dui. Donec tempor enim purus, vel condimentum lorem ultrices nec. Donec auctor tortor lacus, eu auctor risus tempor in. Phasellus quis erat nec diam ornare feugiat sit amet non turpis. Curabitur aliquam lectus ut odio commodo, et hendrerit lorem rutrum. Donec elementum egestas diam et tincidunt. Proin tempus urna at vehicula lacinia."
    },
    {
        title: "My History in Show Dogs",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla sagittis dolor, eu blandit arcu volutpat ut. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam id nulla non diam tincidunt maximus vitae a dui. Donec tempor enim purus, vel condimentum lorem ultrices nec. Donec auctor tortor lacus, eu auctor risus tempor in. Phasellus quis erat nec diam ornare feugiat sit amet non turpis. Curabitur aliquam lectus ut odio commodo, et hendrerit lorem rutrum. Donec elementum egestas diam et tincidunt. Proin tempus urna at vehicula lacinia."
    },
    {
        title: "Closing Statement",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla sagittis dolor, eu blandit arcu volutpat ut. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam id nulla non diam tincidunt maximus vitae a dui. Donec tempor enim purus, vel condimentum lorem ultrices nec. Donec auctor tortor lacus, eu auctor risus tempor in. Phasellus quis erat nec diam ornare feugiat sit amet non turpis. Curabitur aliquam lectus ut odio commodo, et hendrerit lorem rutrum. Donec elementum egestas diam et tincidunt. Proin tempus urna at vehicula lacinia."
    }
];


// --- Cloudflare Keys ---
export const TURNSTYLE_SITE_KEY = "1x00000000000000000000AA"
