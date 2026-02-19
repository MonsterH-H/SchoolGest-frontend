/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales de l'application
        primary: '#007fff',      // Couleur principale (bleu azur moderne)
        accent: '#0059b2',       // Couleur d'accentuation (bleu foncé)
        'azure-light': '#e6f2ff',// Bleu très clair, utile pour les arrière-plans subtils

        // Couleurs de fond et de surface
        background: '#F7FAFC',   // Couleur de fond générale de l'application
        card: '#FFFFFF',         // Couleur de fond pour les cartes et panneaux

        // Couleurs de texte
        'text-primary': '#1a365d', // Couleur du texte principal (bleu foncé, professionnel)
        'text-secondary': '#4a5568',// Couleur du texte secondaire (gris gris)

        // Couleurs de statut et d'alerte
        success: '#10B981',      // Vert pour les succès
        warning: '#F59E0B',      // Orange pour les avertissements
        error: '#EF4444',        // Rouge pour les erreurs

        // Couleur des bordures
        'border-color': '#E9ECEF', // Couleur générale des bordures
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInLeft: 'slideInLeft 0.5s ease-out',
        slideInRight: 'slideInRight 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
};