import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// Declare the x_ite global so TypeScript knows about it.
declare const x_ite: {
    process_x3d_tags: () => void;
};

// Define a type for our X3D nodes that allows any attribute.
// This is used with a component alias for 'div' to satisfy TypeScript
// when using X3D-specific attributes with the `is` property.
type X3DNodeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  is: string;
  [key: string]: any;
};

// Fix: Cast to 'unknown' first to resolve the TypeScript conversion error.
const X3DNode = 'div' as unknown as React.FC<X3DNodeProps>;


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
        <X3DNode is="shape">
            <X3DNode is="appearance">
                <X3DNode is="material" emissiveColor='0.2 0.2 0.2' />
            </X3DNode>
            <X3DNode is="indexedLineSet" coordIndex={indices.join(' ')}>
                <X3DNode is="coordinate" point={points.join(' ')} />
            </X3DNode>
        </X3DNode>
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
        <X3DNode is="shape">
            <X3DNode is="appearance">
                <X3DNode is="material" emissiveColor='1 1 1' />
            </X3DNode>
            <X3DNode is="pointSet">
                <X3DNode is="coordinate" point={points.join(' ')} />
            </X3DNode>
        </X3DNode>
    );
};


const Scene: React.FC = () => {
  const rootRef = useRef<ReactDOM.Root | null>(null);
  
  // Effect to initialize X_ITE after React has rendered the custom elements.
  useEffect(() => {
    // This function is provided by the X_ITE library to process X3D elements
    // that are added to the DOM dynamically, which is what happens with React.
    if (typeof x_ite !== 'undefined' && typeof x_ite.process_x3d_tags === 'function') {
      x_ite.process_x3d_tags();
    }
  }, []); // Empty dependency array ensures this runs only once on mount.


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
    <X3DNode is='x3d-canvas' width='100%' height='100%'>
      <X3DNode is='x3d'>
        <X3DNode is='scene' profile="Immersive">
          <X3DNode is='background' skyColor='0.0 0.0 0.0' />
          <X3DNode is='navigationInfo' type='"EXAMINE" "ANY"' />
          <X3DNode is='viewpoint' position={viewpointPosition} />
          
          <X3DNode is='pointLight' location='0 3 4' intensity='0.8' color='0.4 0.9 0.95' />
          <X3DNode is='pointLight' location='-3 2 3' intensity='0.6' color='0.75 0.5 0.98' />
          
          <X3DNode is='environment' ambientIntensity='0.5' />
          
          {/* Billboard ensures the UI always faces the camera */}
          <X3DNode is='billboard' axisOfRotation='0 0 0'>
              <X3DNode is='transform'>
                  {/* A transparent plane that acts as the canvas for our HTML content */}
                  <X3DNode is='shape'>
                      <X3DNode is='plane' size={uiPlaneSize} />
                      <X3DNode is='appearance'>
                          <X3DNode is='material' transparency='1' />
                      </X3DNode>
                  </X3DNode>
                  {/* X_ITE's html tag renders DOM content in the 3D scene */}
                  {/* Fix: The style prop in React requires an object, not a string. */}
                  <X3DNode is='html' style={{ width: '1400px', height: '800px', fontSize: '16px' }}>
                      {/* React app mounts into the div created here by X_ITE */}
                  </X3DNode>
              </X3DNode>
          </X3DNode>
          
          <Stars radius={100} count={5000} />
          <Grid size={100} divisions={100} />
        </X3DNode>
      </X3DNode>
    </X3DNode>
  );
};

export default Scene;