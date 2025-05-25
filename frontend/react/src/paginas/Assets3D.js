import AssetsGenerico from './AssetsGenerico';
import Filtros3D from './components/filtros/Filtros3D';

function Assets3D() {
  return (
    <AssetsGenerico 
      categoria="Assets 3D"
      titulo="Assets 3D"
      FiltrosComponent={Filtros3D}
    />
  );
}

export default Assets3D;