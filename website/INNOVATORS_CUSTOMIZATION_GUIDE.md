# Innovators Customization Guide

## ✨ Quick Edit Instructions

Your website now has **2 Customizable Innovator Spots** on both the main page and About Us page.

---

## 📍 Where to Find Them

### 1. **Main Page (index.html)**
- Scroll down to "Meet Our Innovators" section
- You'll see 2 cards side by side

### 2. **About Us Page (about.html)**
- Goes to "Meet Our Innovators" section
- Same 2 customizable cards

---

## 🎨 How to Customize Each Innovator Card

### Open the HTML file in VS Code:
1. Open `frontend/index.html` (or `about.html`)
2. Use `Ctrl+F` to find: `Your Name Here`
3. You'll see both innovator templates

---

## 📝 What You Can Edit

### For Each Innovator Card, Change:

```html
<!-- Innovator 1 - Edit this section with your information -->
<div class="team-card">
    <div class="team-avatar">
        <i class="fas fa-lightbulb"></i>  ← Change this icon
    </div>
    <h3 class="team-name">Your Name Here</h3>  ← Change to your name
    <p class="team-role">Your Title</p>  ← Change to your title/role
    <p class="team-bio">Add your bio here...</p>  ← Change to your bio
    
    <!-- Social Links -->
    <div class="team-social">
        <a href="#" class="social-link" title="LinkedIn">...</a>
        <a href="#" class="social-link" title="GitHub">...</a>
        <a href="#" class="social-link" title="Email">...</a>
    </div>
    
    <!-- Skills -->
    <div class="team-skills">
        <span class="skill-tag">Skill 1</span>
        <span class="skill-tag">Skill 2</span>
        <span class="skill-tag">Skill 3</span>
    </div>
</div>
```

---

## 🔄 Step-by-Step Editing Guide

### Step 1: Change the Icon
**Find this line:**
```html
<i class="fas fa-lightbulb"></i>
```

**Replace `fa-lightbulb` with any icon from:**
- `fa-lightbulb` (💡 Lightbulb)
- `fa-rocket` (🚀 Rocket)
- `fa-star` (⭐ Star)
- `fa-code` (💻 Code)
- `fa-brain` (🧠 Brain)
- `fa-cog` (⚙️ Gear)
- `fa-user-tie` (👔 Professional)
- `fa-graduation-cap` (🎓 Education)

**Example:**
```html
<i class="fas fa-rocket"></i>
```

### Step 2: Change the Name
**Find:**
```html
<h3 class="team-name">Your Name Here</h3>
```

**Replace with your name:**
```html
<h3 class="team-name">John Smith</h3>
```

### Step 3: Change the Title/Role
**Find:**
```html
<p class="team-role">Your Title</p>
```

**Replace with your role:**
```html
<p class="team-role">AI Engineer</p>
```

### Step 4: Add Your Bio
**Find:**
```html
<p class="team-bio">Add your bio here. Describe your expertise, experience, and what you bring to the project.</p>
```

**Replace with your bio:**
```html
<p class="team-bio">Passionate AI researcher with 8+ years in machine learning and computer vision. Leading IBCRS innovation.</p>
```

### Step 5: Update Social Links
**Find these lines and replace `#` with actual URLs:**

```html
<!-- LinkedIn -->
<a href="https://linkedin.com/in/yourprofile" class="social-link" title="LinkedIn">
    <i class="fab fa-linkedin"></i>
</a>

<!-- GitHub -->
<a href="https://github.com/yourprofile" class="social-link" title="GitHub">
    <i class="fab fa-github"></i>
</a>

<!-- Email -->
<a href="mailto:your.email@example.com" class="social-link" title="Email">
    <i class="fas fa-envelope"></i>
</a>
```

### Step 6: Add Your Skills
**Find:**
```html
<span class="skill-tag">Skill 1</span>
<span class="skill-tag">Skill 2</span>
<span class="skill-tag">Skill 3</span>
```

**Replace with your skills:**
```html
<span class="skill-tag">Python</span>
<span class="skill-tag">AI/ML</span>
<span class="skill-tag">Research</span>
<span class="skill-tag">Data Science</span>
```

You can add more or fewer skill tags - just duplicate the `<span>` line.

---

## 🎯 Complete Example

Here's a complete customized innovator card:

```html
<!-- Innovator 1 - Example -->
<div class="team-card">
    <div class="team-avatar">
        <i class="fas fa-rocket"></i>
    </div>
    <h3 class="team-name">Sarah Ahmed</h3>
    <p class="team-role">Lead AI Researcher</p>
    <p class="team-bio">PhD in Computer Vision. 6+ years developing ML models for biotech applications. Passionate about making AI accessible.</p>
    <div class="team-social">
        <a href="https://linkedin.com/in/sarahahmed" class="social-link" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
        <a href="https://github.com/sarahahmed" class="social-link" title="GitHub"><i class="fab fa-github"></i></a>
        <a href="mailto:sarah@ibcrs.ai" class="social-link" title="Email"><i class="fas fa-envelope"></i></a>
    </div>
    <div class="team-skills">
        <span class="skill-tag">Python</span>
        <span class="skill-tag">TensorFlow</span>
        <span class="skill-tag">Computer Vision</span>
        <span class="skill-tag">Research</span>
    </div>
</div>
```

---

## 📋 Customization Checklist

- [ ] Changed icon in first card
- [ ] Added first innovator's name
- [ ] Added first innovator's title
- [ ] Added first innovator's bio
- [ ] Updated LinkedIn link for first innovator
- [ ] Updated GitHub link for first innovator
- [ ] Updated email link for first innovator
- [ ] Added skills for first innovator

- [ ] Changed icon in second card
- [ ] Added second innovator's name
- [ ] Added second innovator's title
- [ ] Added second innovator's bio
- [ ] Updated LinkedIn link for second innovator
- [ ] Updated GitHub link for second innovator
- [ ] Updated email link for second innovator
- [ ] Added skills for second innovator

- [ ] Updated BOTH index.html AND about.html
- [ ] Saved both files
- [ ] Tested in browser

---

## 🚀 Font Awesome Icons Reference

Popular icons you can use:

| Icon Class | Display |
|-----------|---------|
| `fa-rocket` | 🚀 Rocket |
| `fa-star` | ⭐ Star |
| `fa-lightbulb` | 💡 Lightbulb |
| `fa-code` | 💻 Code |
| `fa-brain` | 🧠 Brain |
| `fa-cog` | ⚙️ Gear |
| `fa-user-tie` | 👔 Professional |
| `fa-graduation-cap` | 🎓 Education |
| `fa-flask` | 🧪 Flask |
| `fa-microscope` | 🔬 Research |
| `fa-chart-line` | 📈 Analytics |
| `fa-database` | 🗄️ Database |
| `fa-network-wired` | 🌐 Network |

**How to use:**
```html
<i class="fas fa-rocket"></i>  <!-- Replace 'rocket' with any icon name -->
```

---

## 💡 Tips for Great Bios

✅ **DO:**
- Keep it 1-2 sentences
- Mention relevant experience
- Show your passion for the project
- Be professional but friendly

❌ **DON'T:**
- Make it too long
- Use overly technical jargon
- Leave it as placeholder text
- Copy-paste generic bios

**Example Bio:**
"AI specialist with 5+ years in machine learning. Dedicated to advancing biotech component recognition through innovative deep learning solutions."

---

## 🔗 Social Link Format

### LinkedIn
```html
https://linkedin.com/in/yourprofile
```

### GitHub
```html
https://github.com/yourprofile
```

### Email
```html
mailto:your.email@example.com
```

---

## 📝 Important Notes

1. **Edit BOTH Pages:**
   - Make the same changes in `index.html` AND `about.html`
   - Keep both pages consistent

2. **Save Your Changes:**
   - After editing, press `Ctrl+S` to save
   - Refresh your browser to see changes

3. **Test Links:**
   - Click social links to verify they work
   - Test email links

4. **Browser Cache:**
   - If changes don't show, press `Ctrl+Shift+R` (hard refresh)
   - Or clear browser cache

---

## 🎓 Ready to Add More Innovators?

If you later want to add a **3rd or 4th innovator**, simply:

1. Copy an entire `<div class="team-card">...</div>` block
2. Paste it after the existing cards
3. Update the information
4. The grid will automatically adjust

**Example CSS handles up to 6+ cards automatically!**

---

## ❓ Troubleshooting

**Issue:** Changes don't appear in browser
- **Solution:** Hard refresh with `Ctrl+Shift+R`

**Issue:** Social links aren't working
- **Solution:** Make sure URLs start with `https://` or use `mailto:` for email

**Issue:** Icons look weird or don't show
- **Solution:** Make sure icon class is exactly like `fa-rocket` (with hyphen)

**Issue:** Card layout looks broken
- **Solution:** Make sure you didn't accidentally delete HTML tags

---

**Version:** 2.1 - 2 Customizable Innovators
**Last Updated:** February 12, 2026
**Status:** Ready to Customize ✅
