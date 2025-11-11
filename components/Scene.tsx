import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// Declare the x_ite global so TypeScript knows about it.
declare const x_ite: {
    process_x3d_tags: () => void;
};

// Re-declare JSX intrinsic elements for X_ITE tags.
// This tells TypeScript how to type-check these custom elements and their attributes.
// The `is="x3d"` attribute is added as per user suggestion to help the X_ITE library identify its tags.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; name?: string; level?: string; };
      'x3d-canvas': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; width?: string; height?: string };
      'x3d': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string };
      'scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; profile?: string; };
      'background': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; skyColor?: string; };
      'navigationInfo': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; type?: string; };
      'viewpoint': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; position?: string; };
      'pointLight': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; location?: string; intensity?: string; color?: string; ambientIntensity?: string; };
      'billboard': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; axisOfRotation?: string; };
      'transform': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'shape': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'plane': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; size?: string; };
      'appearance': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'material': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; transparency?: string; emissiveColor?: string; };
      // FIX: The 'html' tag conflicts with the standard HTML element type in React's JSX definitions.
      // A circular reference in the previous type definition was causing TypeScript to ignore this entire
      // IntrinsicElements augmentation. By explicitly using React's base type for the 'html' element,
      // the circular reference is broken, which allows all custom X3D tags to be recognized.
      // The original fix was incorrect as it used the generic `HTMLAttributes` which is not compatible.
      // Switched to `HtmlHTMLAttributes` to properly extend the existing definition, fixing the entire augmentation block.
      'html': React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement> & { is?: string };
      'pointSet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'coordinate': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; point?: string; };
      'indexedLineSet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; coordIndex?: string; };
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
        <shape is="x3d">
            <appearance is="x3d">
                <material is="x3d" emissiveColor='0.2 0.2 0.2' />
            </appearance>
            <indexedLineSet is="x3d" coordIndex={indices.join(' ')}>
                <coordinate is="x3d" point={points.join(' ')} />
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
        <shape is="x3d">
            <appearance is="x3d">
                <material is="x3d" emissiveColor='1 1 1' />
            </appearance>
            <pointSet is="x3d">
                <coordinate is="x3d" point={points.join(' ')} />
            </pointSet>
        </shape>
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
    const observer = new MutationObserver((mutationsList, obs) => {
        if (rootRef.current) {
            obs.disconnect();
            return;
        }

        const mountPoint = document.querySelector('html-content > div');
        
        if (mountPoint) {
            obs.disconnect();
            const root = ReactDOM.createRoot(mountPoint);
            rootRef.current = root;
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
        observer.disconnect();
        if (rootRef.current) {
            rootRef.current.unmount();
        }
    };
  }, []);
  
  const uiWidth = 14;
  const uiHeight = 8;
  const uiPlaneSize = `${uiWidth} ${uiHeight}`;
  const viewpointPosition = `0 0 ${uiWidth * 1.2}`;

  return (
    <x3d-canvas is="x3d" width="100%" height="100%">
      <x3d is="x3d">
        <scene is="x3d" profile="Immersive">
          {/* Explicitly declare the HTML component is needed for this profile */}
          <component is="x3d" name="HTML" level="1" />
          <background is="x3d" skyColor='0.0 0.0 0.0' />
          <navigationInfo is="x3d" type='"EXAMINE" "ANY"' />
          <viewpoint is="x3d" position={viewpointPosition} />
          
          <pointLight is="x3d" location='0 3 4' intensity='0.8' ambientIntensity='0.25' color='0.4 0.9 0.95' />
          <pointLight is="x3d" location='-3 2 3' intensity='0.6' ambientIntensity='0.25' color='0.75 0.5 0.98' />
          
          <billboard is="x3d" axisOfRotation='0 0 0'>
              <transform is="x3d">
                  <shape is="x3d">
                      <plane is="x3d" size={uiPlaneSize} />
                      <appearance is="x3d">
                          <material is="x3d" transparency='1' />
                      </appearance>
                  </shape>
                  <html is="x3d" style={{ width: '1400px', height: '800px', fontSize: '16px' }}>
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