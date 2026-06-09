# Video Editor & Graphic Designer Portfolio Website

A professional, modern portfolio website built with vanilla HTML, CSS, and JavaScript. Perfect for showcasing video editing and graphic design projects, along with your resume and contact information.

## Features

✨ **Modern Dark Theme** - Professional dark design perfect for showcasing creative work
🎨 **Responsive Design** - Looks great on desktop, tablet, and mobile devices
⚡ **Smooth Animations** - Fade-in effects and hover transitions throughout
🎯 **Multiple Sections**:
  - Hero/Home section with call-to-action buttons
  - Portfolio grid to showcase projects
  - About section with skills and bio
  - Resume section with experience and education
  - Contact form and links

## Project Structure

```
portfolio/
├── index.html           # Main HTML file
├── css/
│   └── styles.css      # All styling and animations
├── js/
│   └── script.js       # Interactivity and form handling
└── assets/
    ├── projects/       # Add your project files here
    └── images/         # Add your images here
```

## How to Use

### 1. **Open the Website**
   - Simply open `index.html` in your web browser
   - No installation or server required!

### 2. **Customize Your Information**

   **Navigation & Header (in `index.html`):**
   - Change `VE Portfolio` to your name/brand
   ```html
   <a href="#home" class="logo">YOUR NAME</a>
   ```

   **Hero Section:**
   - Update the headline and description
   ```html
   <h1>Creative Video Editor & Graphic Designer</h1>
   <p>Your tagline here...</p>
   ```

   **Portfolio Projects:**
   - Edit the 6 portfolio items with your actual projects
   - Replace emoji placeholders with image placeholders or real images
   ```html
   <div class="portfolio-item">
     <div class="portfolio-image">🎬</div> <!-- Replace with image -->
     <div class="portfolio-content">
       <h3>Your Project Title</h3>
       <p class="project-category">Video Editing</p>
       <p>Project description here</p>
     </div>
   </div>
   ```

   **About Section:**
   - Update your bio and skills
   - Modify the skills list to match your expertise
   ```html
   <span class="skill-tag">Your Skill</span>
   ```

   **Resume Section:**
   - Replace experience, education, and certifications with your own
   - Update dates, job titles, and descriptions

   **Contact Section:**
   - Update email, phone, and social media links
   ```html
   <a href="mailto:your@email.com">Email</a>
   <a href="tel:+1234567890">Phone</a>
   ```

   **Footer:**
   - Update the copyright year and your name
   ```html
   <p>&copy; 2024 Your Name - Video Editor & Graphic Designer.</p>
   ```

### 3. **Add Your Images**
   - Create actual image files in `assets/images/`
   - Replace emoji placeholders with image tags:
   ```html
   <img src="assets/images/your-project.jpg" alt="Project Name">
   ```

### 4. **Customize Colors (Optional)**
   - Edit CSS variables in `css/styles.css`:
   ```css
   :root {
     --primary-color: #1a1a1a;      /* Dark background */
     --accent-color: #00d4ff;       /* Cyan accent */
     --accent-alt: #ff006e;         /* Pink accent */
   }
   ```

## Color Scheme

- **Primary:** Deep Black (#1a1a1a)
- **Secondary:** Dark Gray (#2d2d2d)
- **Accent 1:** Cyan (#00d4ff)
- **Accent 2:** Hot Pink (#ff006e)
- **Text:** White (#ffffff)
- **Muted Text:** Light Gray (#b0b0b0)

## Responsive Breakpoints

- **Desktop:** 1200px max-width container
- **Tablet:** 768px breakpoint
- **Mobile:** Full responsive below 768px

## Features & Interactions

✅ **Smooth Navigation** - Click nav items to smoothly scroll to sections
✅ **Active Link Highlighting** - Nav links highlight as you scroll
✅ **Hover Effects** - Portfolio items lift up and glow on hover
✅ **Scroll Animations** - Elements fade in as they come into view
✅ **Contact Form** - Functional form with validation

## Deployment Options

### Local Testing
- Open `index.html` directly in your browser

### GitHub Pages (Free Hosting)
1. Create a GitHub repository
2. Push all files to the repository
3. Go to Settings → Pages
4. Select main branch as source
5. Your site will be live at `https://yourusername.github.io/portfolio`

### Other Hosting Options
- **Netlify** - Free deployment from GitHub
- **Vercel** - Free hosting service
- **cpanel** - For domain hosting
- **Any web server** - Upload files via FTP

## Tips for Best Results

1. **Use High-Quality Images** - Replace emoji placeholders with professional screenshots or thumbnails of your work
2. **Keep Content Updated** - Regularly update your portfolio with new projects
3. **Optimize Images** - Compress images to keep load times fast
4. **Test on Mobile** - Ensure everything looks good on all devices
5. **Add Video Embeds** - Embed YouTube or Vimeo videos in portfolio items
6. **SEO Optimization** - Update meta tags for better search visibility

## Adding Video Embeds

To add embedded videos to portfolio items:

```html
<div class="portfolio-item">
  <div class="portfolio-image">
    <iframe width="100%" height="250" src="https://www.youtube.com/embed/VIDEO_ID" 
            frameborder="0" allowfullscreen></iframe>
  </div>
</div>
```

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers

## Need Help?

- Double-check all file paths (especially for images)
- Make sure you save changes before refreshing the browser
- Clear browser cache if styles don't update
- Use browser DevTools (F12) to debug JavaScript

## License

Free to use and modify for your portfolio!

---

**Happy showcasing your creative work!** 🚀
