import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// Declare the x_ite global so TypeScript knows about it.
declare const x_ite: {
    process_x3d_tags: () => void;
};

// Re-declare JSX intrinsic elements for X_ITE tags.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // FIX: The entire block of X_ITE custom tag augmentations was being ignored by TypeScript
      // due to a type conflict on the 'html' tag's 'style' attribute. Additionally, the 'is' attribute,
      // used by all tags, was missing from the type definitions. Both issues are now resolved.
      'component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { name?: string; level?: string; is?: string; };
      'x3d-canvas': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'x3d': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { profile?: string; is?: string; };
      'background': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { skyColor?: string; is?: string; };
      'navigationInfo': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { type?: string; is?: string; };
      'viewpoint': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { position?: string; is?: string; };
      'pointLight': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { location?: string; intensity?: string; ambientIntensity?: string; color?: string; is?: string; };
      'billboard': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { axisOfRotation?: string; is?: string; };
      'transform': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'shape': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'plane': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { size?: string; is?: string; };
      'appearance': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'material': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { transparency?: string; emissiveColor?: string; is?: string; };
      // The X3D 'html' tag is a custom element, not the standard document root.
      // It expects a string for its style attribute, which conflicts with React's default.
      'html': React.DetailedHTMLProps<Omit<React.HTMLAttributes<HTMLElement>, 'style'>, HTMLElement> & { style?: string; is?: string; };
      'pointSet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string; };
      'coordinate': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { point?: string; is?: string; };
      'indexedLineSet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { coordIndex?: string; is?: string; };
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
      setTimeout(() => x_ite.process_x3d_tags(), 0);
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
            // Ensure the mount point is empty before rendering
            while(mountPoint.firstChild) {
                mountPoint.removeChild(mountPoint.firstChild);
            }
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
          {/* Corrected type attribute format for multi-string values as per X3D spec */}
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
                  {/* Corrected style attribute from a React object to a string, which the X_ITE parser expects. */}
                  <html is="x3d" style="width: 1400px; height: 800px; font-size: 16px;">
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