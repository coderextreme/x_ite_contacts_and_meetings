import React from 'react';

// Fix: Updated JSX intrinsic element declarations for X3D custom elements to use 'any' type.
// This resolves type conflicts with other libraries (like @react-three/fiber) that may be
// polluting the global JSX namespace, ensuring that the custom X3D tags are correctly
// recognized by TypeScript without attribute type errors.
declare global {
    namespace JSX {
        interface IntrinsicElements {
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
  return (
    <x3d width='100%' height='100%'>
      <scene>
        <background skyColor='0.0 0.0 0.0'></background>
        <navigationInfo type='"EXAMINE" "ANY"'></navigationInfo>
        <viewpoint position='0 1.6 8'></viewpoint>
        
        <pointLight location='0 3 4' intensity='0.8' color='0.4 0.9 0.95'></pointLight>
        <pointLight location='-3 2 3' intensity='0.6' color='0.75 0.5 0.98'></pointLight>
        
        <environment ambientIntensity='0.5'></environment>
        
        <Stars radius={100} count={5000} />
        <Grid size={100} divisions={100} />
      </scene>
    </x3d>
  );
};

export default Scene;