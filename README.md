# Portfolio Website

A modern, interactive portfolio website inspired by Google Labs design. This website features an elegant dark theme with horizontally scrolling experience tiles that display animations on hover.

## Features

- **Modern UI Design**: Clean, dark theme inspired by Google Labs
- **Interactive Tiles**: Each tile has unique hover animations
- **Horizontal Scrolling**: Showcase multiple experiences with smooth horizontal scrolling
- **Responsive Design**: Looks great on all devices
- **Popup Details**: Click on any tile to view detailed experience information
- **Easy to Customize**: Simply edit the content in HTML/JS files to make it your own

## Preview

To preview the website locally, you can use any of these methods:

### Method 1: Open Directly in Browser

Simply open the `index.html` file in your web browser.

### Method 2: Using Python's Built-in Server

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then navigate to `http://localhost:8001` in your browser.

### Method 3: Using Node.js

If you have Node.js installed, you can use a package like `http-server`:

```bash
# Install globally if you haven't already
npm install -g http-server

# Run the server
http-server
```

Then visit `http://localhost:8080` in your browser.

## Customization

### Profile Information

1. **Update Profile Image**: Replace `images/profile.jpg` with your own photo
2. **Update Contact Links**: Edit the email and LinkedIn links in `index.html`

### Content

1. **Experience Tiles**: 
   - Update the headings and descriptions in the HTML for each tile
   - Customize colors by changing the background-color values
   
2. **Experience Details**: 
   - Edit the content in the `experienceData` array in `script.js`
   - Each entry contains title, date, role, description, highlights, and skills

### Styling

- All styling is contained in `styles.css`
- Animation styles are grouped by tile

## Deployment

### GitHub Pages

1. Create a GitHub repository
2. Push your code to the repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

3. Go to repository Settings > Pages
4. Select "main" branch as source and click Save
5. Your site will be published at `https://yourusername.github.io/your-repo-name/`

### Netlify

1. Sign up for a Netlify account
2. Go to "New site from Git"
3. Connect to your GitHub repository
4. Deploy! Netlify will provide a custom URL that you can later customize

### Vercel

1. Sign up for a Vercel account
2. Import your GitHub repository
3. Deploy! Vercel will build and host your site automatically

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Works on mobile devices with touch control support

## License

This project is open-source and available for personal and commercial use.

## Credits

- Font Awesome for icons
- Google Fonts for typography
- Inspired by Google Labs design 