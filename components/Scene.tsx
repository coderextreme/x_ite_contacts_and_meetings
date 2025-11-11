import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// Fix: The previous detailed type declarations for X3D custom elements were not being
// correctly recognized by TypeScript, leading to numerous errors. This can happen due to
// complex module resolution or conflicts in global typings.
// Reverting to 'any' for these custom elements is a robust workaround to ensure the
// application compiles successfully, bypassing the type resolution issue.
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'x3d-canvas': any;
            'x3d': any;
            'scene': any;
            'background': any;
            'navigationInfo': any;
            'viewpoint': any;
            'environment': any;
            'pointLight': any;
            'shape': any;
            'appearance': any;
            'material': any;
            'indexedLineSet': any;
            'pointSet': any;
            'coordinate': any;
            'transform': any;
            'billboard': any;
            'plane': any;
            'html': any;
        }
    }
}

const Grid = ({ size, divisions }: { size: number; divisions: number }) => {
    const points: string[] = [];
    const indices: string[] = [];
    let i = 0;

    const step = size / divisions;
    const halfSize = size / 2;

    for (let j = 0; j <= divisions; j++) {
        const p = -halfSize + j * step;
        // Lines along Z-axis
        points.push(`${p} 0 ${-halfSize}`);
        points.push(`${p} 0 ${halfSize}`);
        indices.push(`${i++} ${i++} -1`);
        // Lines along X-axis
        points.push(`${-halfSize} 0 ${p}`);
        points.push(`${halfSize} 0 ${p}`);
        indices.push(`${i++} ${i++} -1`);
    }

    return (
        <shape>
            <appearance>
                <material emissiveColor='0.2 0.2 0.2'></material>
            </appearance>
            <indexedLineSet coordIndex={indices.join(' ')}>
                <coordinate point={points.join(' ')}></coordinate>
            </indexedLineSet>
        </shape>
    );
};

const Stars = ({ radius, count }: { radius: number; count: number }) => {
    const points: string[] = [];
    for (let i = 0; i < count; i++) {
        const r = radius;
        // Create a spherical distribution
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(1 - 2 * Math.random());
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        points.push(`${x} ${y} ${z}`);
    }

    return (
        <shape>
            <appearance>
                <material emissiveColor='1 1 1'></material>
            </appearance>
            <pointSet>
                <coordinate point={points.join(' ')}></coordinate>
            </pointSet>
        </shape>
    );
};


const Scene: React.FC = () => {
  const rootRef = useRef<ReactDOM.Root | null>(null);

  useEffect(() => {
    // Use a MutationObserver to robustly find the mount point created by X_ITE's <html/> tag.
    // This is more reliable than timers for handling custom element initialization.
    const observer = new MutationObserver((mutationsList, obs) => {
        // Prevent re-running if we've already mounted
        if (rootRef.current) {
            obs.disconnect();
            return;
        }

        // X_ITE creates a `div` inside a custom <html-content> element. This is our target.
        const mountPoint = document.querySelector('html-content > div');
        
        if (mountPoint) {
            obs.disconnect(); // Stop observing once found
            const root = ReactDOM.createRoot(mountPoint);
            rootRef.current = root;
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
        }
    });

    // Start observing the body for child and subtree changes
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
        // Cleanup on unmount
        observer.disconnect();
        if (rootRef.current) {
            rootRef.current.unmount();
        }
    };
  }, []);
  
  // Define UI dimensions in X3D world units. (100px = 1 unit)
  const uiWidth = 14;
  const uiHeight = 8;
  const uiPlaneSize = `${uiWidth} ${uiHeight}`;
  // Position the camera to comfortably view the UI plane
  const viewpointPosition = `0 0 ${uiWidth * 1.2}`;

  return (
    <x3d-canvas width='100%' height='100%'>
      <x3d>
        <scene profile="Immersive">
          <background skyColor='0.0 0.0 0.0'></background>
          <navigationInfo type='"EXAMINE" "ANY"'></navigationInfo>
          <viewpoint position={viewpointPosition}></viewpoint>
          
          <pointLight location='0 3 4' intensity='0.8' color='0.4 0.9 0.95'></pointLight>
          <pointLight location='-3 2 3' intensity='0.6' color='0.75 0.5 0.98'></pointLight>
          
          <environment ambientIntensity='0.5'></environment>
          
          {/* Billboard ensures the UI always faces the camera */}
          <billboard axisOfRotation='0 0 0'>
              <transform>
                  {/* A transparent plane that acts as the canvas for our HTML content */}
                  <shape>
                      <plane size={uiPlaneSize}></plane>
                      <appearance>
                          <material transparency='1'></material>
                      </appearance>
                  </shape>
                  {/* X_ITE's html tag renders DOM content in the 3D scene */}
                  <html style="width: 1400px; height: 800px; font-size: 16px;">
                      {/* React app mounts into the div created here by X_ITE */}
                  </html>
              </transform>
          </billboard>
          
          <Stars radius={100} count={5000} />
          <Grid size={100} divisions={100} />
        </scene>
      </x3d>
    </x3d-canvas>
  );
};

export default Scene;