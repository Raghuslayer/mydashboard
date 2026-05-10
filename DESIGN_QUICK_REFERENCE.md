# 🎨 3D Design System - Quick Reference

## CSS Classes to Use

### 3D Depth Layers
```jsx
<div className="depth-1">  {/* 10px depth */}
<div className="depth-2">  {/* 20px depth */}
<div className="depth-3">  {/* 30px depth */}
<div className="depth-4">  {/* 40px depth */}
<div className="depth-5">  {/* 50px depth */}
```

### Panels & Cards
```jsx
<div className="glass-panel">        {/* 3D glass with blur */}
<div className="tile">                {/* Unique shaped tile */}
<div className="btn-3d">              {/* 3D button */}
```

### Animations
```jsx
<div className="animate-float">       {/* Gentle floating */}
<div className="animate-glow">        {/* Pulsing glow */}
<div className="animate-in">          {/* Fade in up */}
<div className="holographic">         {/* Rainbow shift */}
```

### Text Effects
```jsx
<h1 className="fire-text">            {/* Neon gradient text */}
<h1 className="header-font">          {/* Teko font */}
<h1 className="accent-font">          {/* Bebas Neue font */}
```

### Glow Effects
```jsx
<div className="neon-glow-cyan">      {/* Cyan glow */}
<div className="neon-glow-purple">    {/* Purple glow */}
<div className="neon-glow-pink">      {/* Pink glow */}
```

### Custom Shapes
```jsx
<div className="card-hexagon">        {/* Hexagon shape */}
<div className="card-octagon">        {/* Octagon shape */}
<div className="card-diamond">        {/* Diamond shape */}
<div className="card-arrow">          {/* Arrow shape */}
```

### Progress Bars
```jsx
<div className="progress-track">      {/* Track container */}
  <div className="progress-fill">     {/* Animated fill */}
</div>
```

---

## Color Palette

### CSS Variables
```css
var(--color-primary)      /* Theme primary */
var(--color-secondary)    /* Theme secondary */
var(--color-accent)       /* Theme accent */
var(--color-glow)         /* Glow color */
var(--gradient-from)      /* Gradient start */
var(--gradient-via)       /* Gradient middle */
var(--gradient-to)        /* Gradient end */
```

### Direct Colors
```css
#00f0ff  /* Neon Cyan */
#b537f2  /* Neon Purple */
#ff006e  /* Neon Pink */
#0066ff  /* Electric Blue */
#39ff14  /* Lime Green */
#ff6b35  /* Sunset Orange */
#1a0033  /* Deep Purple */
#0a0e27  /* Dark Navy */
#050814  /* Midnight */
```

---

## Common Patterns

### 3D Card with Hover
```jsx
<div className="glass-panel depth-2 cursor-pointer hover:depth-4">
  <div className="holographic opacity-20">
    {/* Content */}
  </div>
</div>
```

### Glowing Button
```jsx
<button className="btn-3d bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] animate-glow">
  Click Me
</button>
```

### Floating Achievement
```jsx
<div className="animate-float depth-3">
  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ff006e] to-[#b537f2] animate-glow">
    <FontAwesomeIcon icon={faTrophy} />
  </div>
</div>
```

### Neon Text Header
```jsx
<h1 className="header-font text-5xl fire-text animate-float">
  Your Title Here
</h1>
```

### Progress with Shimmer
```jsx
<div className="progress-track h-4 rounded-full">
  <div className="progress-fill h-full" style={{ width: '75%' }}>
    {/* Shimmer effect built-in */}
  </div>
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Reduced 3D effects */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Moderate 3D effects */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Full 3D experience */
}
```

---

## Animation Timings

```css
/* Fast */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Normal */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

/* Slow */
transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Tips

### ✅ DO
- Use `depth-*` classes for layering
- Combine `glass-panel` with `depth-*`
- Add `holographic` for rainbow effects
- Use `animate-glow` on interactive elements
- Apply `fire-text` to important headings

### ❌ DON'T
- Stack too many depth layers (max 3-4)
- Overuse animations (causes distraction)
- Mix too many glow colors
- Forget hover states on interactive elements
- Use flat colors (always use gradients)

---

## Quick Examples

### Hero Section
```jsx
<div className="glass-panel p-8 depth-3">
  <div className="holographic opacity-10 absolute inset-0" />
  <h1 className="fire-text header-font text-5xl animate-float">
    Welcome Back!
  </h1>
</div>
```

### Action Button
```jsx
<button className="btn-3d px-6 py-3 bg-gradient-to-r from-[#ff006e] to-[#b537f2] animate-glow">
  <FontAwesomeIcon icon={faPlus} />
  Add New
</button>
```

### Stats Card
```jsx
<div className="glass-panel p-6 depth-2">
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#0066ff] animate-glow flex items-center justify-center">
    <span className="text-2xl font-bold">42</span>
  </div>
  <p className="fire-text mt-2">Level</p>
</div>
```

### Achievement Badge
```jsx
<div className="animate-float depth-3">
  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#39ff14] to-[#00f0ff] animate-glow relative overflow-hidden">
    <div className="holographic opacity-40 absolute inset-0" />
    <FontAwesomeIcon icon={faTrophy} className="text-3xl text-white" />
  </div>
</div>
```

---

## Performance Tips

1. **Use `will-change` sparingly**
   ```css
   will-change: transform;
   ```

2. **Prefer `transform` over position changes**
   ```css
   /* Good */
   transform: translateY(-10px);
   
   /* Bad */
   top: -10px;
   ```

3. **Limit simultaneous animations**
   - Max 10-15 animated elements visible at once

4. **Use `requestAnimationFrame` for JS animations**

5. **Reduce motion for accessibility**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation: none !important;
       transition: none !important;
     }
   }
   ```

---

## Troubleshooting

### Issue: 3D effects not showing
**Solution**: Check if parent has `perspective: 1000px`

### Issue: Animations laggy
**Solution**: Reduce number of animated elements or use `will-change`

### Issue: Colors not updating
**Solution**: Check CSS variable is defined in `:root[data-theme]`

### Issue: Depth not visible
**Solution**: Ensure parent has `transform-style: preserve-3d`

### Issue: Glow not showing
**Solution**: Check `box-shadow` and `var(--color-glow)` are set

---

## Browser Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers (iOS/Android)

⚠️ IE11 not supported (uses modern CSS)

---

**Remember**: The goal is to create an immersive, motivating experience. Use 3D effects purposefully to enhance, not distract! 🚀✨
