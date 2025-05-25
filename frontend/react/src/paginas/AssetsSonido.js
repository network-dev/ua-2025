import AssetsGenerico from './AssetsGenerico';
import FiltrosSonido from './components/filtros/FiltrosSonido';

function AssetsSonido() {
  return (
    <AssetsGenerico 
      categoria="Sonido"
      titulo="Assets de Sonido"
      FiltrosComponent={FiltrosSonido}
    />
  );
}

export default AssetsSonido;
