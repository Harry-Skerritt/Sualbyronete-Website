// src/config/siteSettings.ts

// --- Essentials ---
export const baseURL = import.meta.env.BASE_URL.replace(/\/$/, '');
export const mediaURL = "";

// --- Head Names ---
export const SITE_NAME = "Sualbyronete";
export const ADMIN_SITE_NAME = "Admin Dashboard";
export const SITE_DESCRIPTION = "Breeder of Yorkshire and Biewer Terriers";

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
export const FACEBOOK_LINK = "https://www.facebook.com/groups/720742637731158";
export const WHATSAPP_LINK = "https://wa.me/447701043475?text=Hi%20Sue,%20I%20saw%20your%20website%20and%20wanted%20to%20reach%20out!";
export const MESSENGER_LINK = "https://m.me/susan.francis.3158";


// --- Puppy Info ---
export const RESERVATION_COST = "£200";
export const RESERVATION_LENGTH = "";

export const PUPPY_COLOURS = [
    { value: "black-tan",        label: "Black & Tan",          breed: "Yorkie" },
    { value: "steel-blue-tan",   label: "Steel Blue & Tan",     breed: "Yorkie" },
    { value: "white-black-tan",  label: "White, Black & Tan",   breed: "Biewer" },

]

export const PUPPY_INCLUSIONS = [
    { id: "inc_1", value: "Pedigree", sortOrder: 0, isSubItem: false },
    { id: "inc_2", value: "Vaccinations", sortOrder: 1, isSubItem: false },
    { id: "inc_3", value: "Health Record", sortOrder: 2, isSubItem: false },
    { id: "inc_4", value: "Microchipped", sortOrder: 3, isSubItem: false },
    { id: "inc_5", value: "Insured", sortOrder: 4, isSubItem: false },
    { id: "inc_6", value: "Socialised with other dogs", sortOrder: 5, isSubItem: false },
    { id: "inc_7", value: "Puppy Pack Including:", sortOrder: 6, isSubItem: false },
    { id: "inc_8", value: "Owners Contract", sortOrder: 7, isSubItem: true },
    { id: "inc_9", value: "Feeding Instructions", sortOrder: 8, isSubItem: true },
    { id: "inc_10", value: "History from Birth to when they join your family", sortOrder: 9, isSubItem: true }
];

// --- Bios ---
export const YORKIE_DEFAULT_BIO = "This is a Yorkshire Terrier!";
export const BIEWER_DEFAULT_BIO = "This is a Biewer Terrier!";


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
export const TURNSTYLE_SITE_KEY = "0x4AAAAAADiGATZxyjS9-Hh3"
