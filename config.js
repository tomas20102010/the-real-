// Supabase Configuration
const SUPABASE_URL = 'https://kjuxvoreiswvstztvwbv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdXh2b3JlaXN3dnN0enR2d2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMDk0NjcsImV4cCI6MjEwODU4NTQ2N30.CNZtSt01uuzBc99bIslsfCGATH8IWfW1ao3aml-8lCU';

(function() {
    function initClient() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseClient = client;
            window.supabase = client;
            return true;
        }
        return false;
    }

    if (initClient()) {
        console.log("Supabase inicializado correctamente");
        return;
    }

    const interval = setInterval(function() {
        if (initClient()) {
            console.log("Supabase inicializado correctamente");
            clearInterval(interval);
        }
    }, 50);

    setTimeout(function() {
        clearInterval(interval);
        if (!window.supabaseClient) {
            console.error("No se pudo inicializar Supabase");
        }
    }, 5000);
})();

// Games Database - Popular Games
const GAMES = [
    {
        id: 1,
        title: "Cyberpunk 2077",
        genre: "RPG",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop",
        description: "Un RPG de mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder, el glamour y la modificación corporal."
    },
    {
        id: 2,
        title: "The Witcher 3: Wild Hunt",
        genre: "RPG",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop",
        description: "Como Geralt de Rivia, un cazador de monstruos a sueldo, emprende un viaje épico a través de un mundo abierto devastado por la guerra."
    },
    {
        id: 3,
        title: "Elden Ring",
        genre: "Action RPG",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=200&fit=crop",
        description: "Un vasto mundo fantástico creado por Hidetaka Miyazaki y George R.R. Martin. Explora las Tierras Intermedias."
    },
    {
        id: 4,
        title: "Grand Theft Auto V",
        genre: "Action",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop",
        description: "Los Santos es una ciudad en decadencia llena de estafadores, tramposos y fracasados. Un ladrón callejero, un exconvicto y un psicópata."
    },
    {
        id: 5,
        title: "Minecraft",
        genre: "Sandbox",
        price: 26.95,
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=200&fit=crop",
        description: "Construye cualquier cosa que puedas imaginar, descubre misterios inquietantes y sobrevive la noche en el juego de bloques definitivo."
    },
    {
        id: 6,
        title: "Red Dead Redemption 2",
        genre: "Action Adventure",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=200&fit=crop",
        description: "Estados Unidos, 1899. El ocaso del Salvaje Oeste ha comenzado. Las fuerzas de la ley dan caza a las bandas forajidas."
    }
];

// Utility function to format price
function formatPrice(price) {
    return '$' + price.toFixed(2);
}

// Check if user is logged in
async function checkAuth() {
    const client = window.supabaseClient || window.supabase;
    if (!client || !client.auth) return null;
    const { data: { session } } = await client.auth.getSession();
    return session;
}

// Get current user
async function getCurrentUser() {
    const client = window.supabaseClient || window.supabase;
    if (!client || !client.auth) return null;
    const { data: { user } } = await client.auth.getUser();
    return user;
}