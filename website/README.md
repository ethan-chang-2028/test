# Paint Battle Website

A modern, responsive website for Paint Battle - the real-time marble-driven autobattler game.

## Overview

This website showcases the Paint Battle game, built based on the Product Requirements Document (PRD). It features:

- **Hero Section**: Eye-catching introduction with game preview
- **Game Overview**: Core gameplay mechanics and features
- **Goals & Metrics**: Project objectives and success criteria
- **Gameplay Sections**: Detailed mechanics, factions, weapons, and maps
- **Game Modes**: 1v1, 4-player, and 9-player mode descriptions
- **AI Coach**: Post-match AI feedback system explanation
- **Architecture**: System architecture and database schema
- **Monetization**: Ethical monetization strategy
- **Technical Specs**: Detailed technical specifications

## Features

- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Clean, professional design with smooth animations
- **Interactive Elements**: Hover effects, scroll animations, and smooth transitions
- **Mobile-Friendly**: Optimized for mobile devices with hamburger menu
- **Fast Loading**: Optimized assets and minimal dependencies

## Quick Start

### Option 1: Open in Replit

1. Create a new Replit project
2. Upload all files from this `website` folder
3. Run the project - it will start a web server on port 8000
4. Open the preview to see the website

### Option 2: Local Development

1. Navigate to the `website` folder:
   ```bash
   cd website
   ```

2. Start a simple web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

3. Open your browser and go to:
   ```
   http://localhost:8000
   ```

### Option 3: Deploy to Netlify/Vercel

1. Push this folder to a GitHub repository
2. Connect your repository to Netlify or Vercel
3. Deploy - the site will be live instantly

## Project Structure

```
website/
├── index.html          # Main HTML file
├── style.css           # All styles and animations
├── script.js           # JavaScript for interactivity
├── .replit             # Replit configuration
├── replit.nix          # Replit Nix configuration
└── README.md           # This file
```

## Customization

### Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary: #2563eb;
    --secondary: #10b981;
    --accent: #f59e0b;
    /* ... more colors */
}
```

### Content
Edit the HTML files to change text, images, and structure.

### Animations
Modify the animations in `style.css` or add new ones in `script.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **Vanilla JavaScript**: No frameworks, lightweight and fast
- **Google Fonts**: Orbitron and Inter fonts
- **CSS Variables**: Easy theming and customization

## Performance

- **No external dependencies** (except Google Fonts)
- **Minimal JavaScript** for fast loading
- **Optimized CSS** with efficient selectors
- **Lazy loading** for better performance

## License

This website is part of the Paint Battle project. All rights reserved.

## Credits

- Fonts: [Google Fonts](https://fonts.google.com/)
- Design: Custom design based on Paint Battle PRD
- Development: Built with modern web standards

## Contact

For questions or support, please refer to the main Paint Battle repository.
