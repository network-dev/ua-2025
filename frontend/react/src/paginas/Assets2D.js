import AssetsGenerico from './AssetsGenerico';
import Filtros2D from './components/filtros/Filtros2D';

function Assets2D() {
  return (
    <AssetsGenerico 
      categoria="Assets 2D"
      titulo="Assets 2D"
      FiltrosComponent={Filtros2D}
    />
  );
}

export default Assets2D;