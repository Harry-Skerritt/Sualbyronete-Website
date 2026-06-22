// src/config/siteSettings.ts

export {};

// --- Essentials ---
export const baseURL = import.meta.env.BASE_URL.replace(/\/$/, '');
export const mediaURL = "";
export const prodURL = "https://sualbyronete.co.uk";
export const TURNSTYLE_SITE_KEY = "0x4AAAAAADiGATZxyjS9-Hh3"

// --- Head Names ---
export const SITE_NAME = "Sualbyronete";
export const ADMIN_SITE_NAME = "Admin Dashboard";
export const SITE_DESCRIPTION = "Breeder of Yorkshire and Biewer Terriers";

// --- Breeder Info ---
export const BREEDER_NAME = "Susan Francis";
export const BREEDER_NAME_SHORT = "Sue";
export const BREEDER_IMAGE = {
    "src": "images/susan.webp",
    "alt": "Susan Francis"
};

export const BREEDER_LICENCE_NO = "18/03111/AWDB";
export const LICENCE_FILE_NAME = "licence.webp"; // In public/certs
export const OTHER_CERTIFICATIONS = [
    { title: "Kennel Name Grant",                   subtext: "",    uri: "kennel-name.webp" },
    { title: "Microchip Certificate",               subtext: "",    uri: "microchip.webp" },
    { title: "Canine Care, Behaviour and Welfare",  subtext: "",    uri: "canine-care.webp" },
    { title: "Canine Nutrition",                    subtext: "",    uri: "canine-nutrition.webp" },
    { title: "Breeding CPD",                        subtext: "",    uri: "cpd.webp" },
    { title: "Ultrasonic Teeth Cleaning",           subtext: "",    uri: "teeth-cleaning.webp" },
];

// --- Nav Images ---
export const PUPPY_NAV_IMAGE = {
    "src": "images/nav/puppyDog.webp",
    "alt": "Yorkshire Terrier and Biewer Terrier Puppies Sitting Together"
};

export const ADULT_NAV_IMAGE = {
    "src": "images/nav/adultDog.webp",
    "alt": "Yorkshire Terrier Walking in a Field"
}

// --- Homepage Second Image ---
export const HOMEPAGE_SECOND_PHOTO = {
    "src": "images/grace.webp",
    "alt": "Grace Walking in a Field"
}

// --- Contact Details ---
export const CONTACT_NUMBER = "07701043475";
export const INSTAGRAM_LINK = "https://www.instagram.com/suefrancis55/";
export const FACEBOOK_LINK = "https://www.facebook.com/profile.php?id=61590779248537";
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
    { id: "inc_1", value: "Pedigree", content: "", sortOrder: 0, isSubItem: false },
    { id: "inc_2", value: "Vaccinations", content: "", sortOrder: 1, isSubItem: false },
    { id: "inc_3", value: "Health Record", content: "", sortOrder: 2, isSubItem: false },
    { id: "inc_4", value: "Microchipped", content: "", sortOrder: 3, isSubItem: false },
    { id: "inc_5", value: "Insured", content: "", sortOrder: 4, isSubItem: false },
    { id: "inc_6", value: "Socialised with other dogs", content: "", sortOrder: 5, isSubItem: false },
    { id: "inc_7", value: "Puppy Pack Including:", content: "", sortOrder: 6, isSubItem: false },
    { id: "inc_8", value: "Owners Contract", content: "", sortOrder: 7, isSubItem: true },
    { id: "inc_9", value: "Feeding Instructions", content: "", sortOrder: 8, isSubItem: true },
    { id: "inc_10", value: "History from Birth to when they join your family", content: "", sortOrder: 9, isSubItem: true }
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
        body: "I have bred Yorkshire Terriers for over 30 years, and my journey began with my first beloved pet, Zoey.\n" +
            "My love for the breed grew with Xena and Zara, whose puppies made it even stronger.\n" +
            "After losing them, I became interested in showing Yorkshire Terriers and was proud to own successful dogs such as Bella and Byron, who qualified for Crufts for life.\n" +
            "Grace, Byron’s daughter, has always held a special place in my heart and remains part of my logo.\n" +
            "I later discovered a passion for Biewer Terriers, and today I continue breeding both with dedication, care, and high standards"
    },

    {
        title: "A Bit More About Me",
        body: "Many years I go I worked in an office for an Engineering company, alongside my father. Following this I moved on to working for Whitworths typing invoiced and general office work. However, before long I moved to the Bookkeeping company Collets. Collets served as an introduction to Bookkeeping and I started working freelance for a local company using the Kalamazoo system to maintain books."
    },
    {
        title: "",
        body: "In the following years I worked with many different businesses from paint distributors and engineering firms to meat manufacturers and fashion designers. Through this career I gained many skills, especially in software such as Sage and Quickbooks. Whilst I have mostly retired from bookkeeping now, I continue to payroll and accounting for one of my longest clients."
    },
    {
        title: "",
        body: "Throughout my entire Bookkepping career, I have always had an interest in breeding and showing animals starting out having kept rabbits and cats, however it was always a goal of mine to breed and show Yorkshire Terriers.",
    },

    {
        title: "My History of Showing and Breeding Dogs",
        body: "I have been breeding Yorkshire Terriers for several years now. It all started when I approached a very knowledgeable show person, Anastasija, regarding a dog that I could show in the future. My friend Christine and I went to look at the litter of puppies Anastasija had at the time, from which I purchased my first show girl, Bella. Once Bella was 6 months old, I attended my first shows, under the mentorship of Anastasija.\n"
    },
    {
        title: "",
        body: "Christine and I, who was showing Cocker Spaniels at the time visited many shows together and grew to love the show world. The love of the show world encouraged me to try and improve my show dogs to be closer towards the breed standard required in the show ring.\n"
    },
    {
        title: "",
        body: "With this goal in mind, I purchased Byron, my first show boy who was a puppy from the Manyork line. Byron was a good specimen in the showing world and during his show career acquired a reserve CC which entitled him to be a lifelong exhibitor for Crufts"

    },
    {
        title: "",
        body: "Byron was also my introduction to the world of Yorkshire Terrier breeding. The first litter of Yorkies I had were the children of Bella and Byron. From this litter I kept a puppy, Aprilla who was the mother to my beloved Grace. Grace joined me and Byron at many shows. She also mothered a litter and thrived with the everyday duties of motherhood. Grace is dearly missed and was a well-loved member of the Family."
    },
    {
        title: "",
        body: "Byron’s line is still thriving at Sualbyronete, with my last show dog being his Great Granddaughter, Juliana. Juliana was part of the Eastern Counties Yorkshire Terrier Club, and Frank Cane, who is one of the UK’s most renowned all-breed championship judges and television presenters, stated in relation to Juliana: “You have a very good show dog here”."
    },
    {
        title: "",
        body: "Unfortunately, due to unforeseen and unavoidable circumstances this was my last show. However, I still have Juliana and would like to continue showing in the future so watch this space!"
    },
    {
        title: "",
        body: "Alongside Yorkshire Terriers, I have always had a love for the Biewer Terrier. My introduction to this breed was Jasmine, who was a lovely example of the breed. I kept one of Jasmines daughters, Zelda ,and with the addition of my new stud boy Albus, plan to breed these alongside my Yorkies!"
    },
    {
        title: "",
        body: "Due to the Biewer being a new breed, they are not currently recognised by the Royal Kennel Club. Due to this, the availability and advertising opportunities for Biewer’s is far lower than Yorkies, so mostly relies on word of mouth! Despite this, I will continue to breed Biewers to the breed standard as recognised in Europe, Ireland and America!"
    },

    {
        title: "Thank You!",
        body: "Thank you for checking out my website and helping me to keep going with the things I love. I hope that I can help you find your new furry friend, and feel free to reach out with any queries you may have!"
    }
];


