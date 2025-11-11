document.addEventListener('DOMContentLoaded', () => {
    // A short delay to ensure the X_ITE scene has been parsed
    setTimeout(() => {
        const testContainer = document.getElementById('test-container');
        
        if (testContainer) {
            console.log("Minimal scene has been parsed by X_ITE. Injecting test content.");
            testContainer.innerHTML = `
                <h1 style="font-size: 24px; font-weight: bold; color: #a5b4fc;">Minimal Test Case</h1>
                <p style="margin-top: 10px;">If you can see this, the core X_ITE HTML rendering feature is working correctly.</p>
                <p style="margin-top: 10px;">This indicates the crash was caused by a specific node we removed (e.g., &lt;navigationInfo&gt; or an explicit light configuration).</p>
            `;
        } else {
            console.error("Minimal test failed: The #test-container element was not found in the DOM after the scene was parsed.");
        }
    }, 100); // A small timeout can help ensure X_ITE has processed the nodes.
});
