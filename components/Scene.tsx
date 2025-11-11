import React from 'react';

// Fix: Add type declarations for custom X3D elements to the global JSX namespace
// to resolve TypeScript errors about unknown properties on JSX.IntrinsicElements.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'x3d': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, width?: string, height?: string };
      'scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string };
      'navigationInfo': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, type?: string };
      'viewpoint': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, position?: string };
      'background': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, skyColor?: string };
      'pointLight': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, location?: string, intensity?: string, color?: string };
      'environment': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, ambientIntensity?: string };
      'shape': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string };
      'appearance': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string };
      'material': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, emissiveColor?: string };
      'pointSet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string };
      'coordinate': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, point?: string };
      'indexedLineSet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { is?: string, coordIndex?: string };
    }
  }
}

// Helper to generate random star positions
const generateStars = (count: number, radius: number) => {
    let points = '';
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        points += `${x} ${y} ${z} `;
    }
    return points.trim();
};

const Grid = ({ size, divisions }: { size: number, divisions: number }) => {
    const step = size / divisions;
    const halfSize = size / 2;
    const coords = [];
    const indices = [];
    let index = 0;

    for (let i = 0; i <= divisions; i++) {
        // Line parallel to Z-axis
        coords.push(-halfSize, 0, -halfSize + i * step);
        coords.push(halfSize, 0, -halfSize + i * step);
        indices.push(index++, index++);

        // Line parallel to X-axis
        coords.push(-halfSize + i * step, 0, -halfSize);
        coords.push(-halfSize + i * step, 0, halfSize);
        indices.push(index++, index++);
    }

    return (
        <shape>
            <appearance>
                <material emissiveColor='0.2 0.2 0.2'></material>
            </appearance>
            <indexedLineSet coordIndex={indices.join(' -1 ') + ' -1'}>
                <coordinate point={coords.join(' ')}></coordinate>
            </indexedLineSet>
        </shape>
    );
};


const Scene: React.FC = () => {
  const starPoints = generateStars(5000, 100);

  // Using custom JSX pragmas or @ts-ignore would be needed in a real TS project
  // for non-standard HTML tags. For this context, we assume JSX handles it.
  return (
    <x3d is="x3d" width="100%" height="100%">
        <scene is="scene">
            <navigationInfo is="navigationInfo" type='"EXAMINE" "ANY"'></navigationInfo>
            <viewpoint is="viewpoint" position="0 1.6 8"></viewpoint>
            <background is="background" skyColor='0.0 0.0 0.0'></background>
            
            {/* Lighting */}
            <pointLight is="pointLight" location='0 3 4' intensity='0.8' color='0.4 0.9 0.95'></pointLight>
            <pointLight is="pointLight" location='-3 2 3' intensity='0.6' color='0.75 0.5 0.98'></pointLight>
            <environment is="environment" ambientIntensity="0.5"></environment>
            
            {/* Stars */}
            <shape is="shape">
                <appearance is="appearance">
                    <material is="material" emissiveColor='1 1 1'></material>
                </appearance>
                <pointSet is="pointSet">
                    <coordinate is="coordinate" point={starPoints}></coordinate>
                </pointSet>
            </shape>

            {/* Grid Floor */}
            <Grid size={100} divisions={100} />
        </scene>
    </x3d>
  );
};

export default Scene;