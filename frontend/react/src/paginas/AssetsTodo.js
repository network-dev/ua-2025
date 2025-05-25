import AssetsGenerico from './AssetsGenerico';
import FiltrosTodo from './components/filtros/FiltrosTodo';

function AssetsTodo() {
  return (
    <AssetsGenerico 
      categoria=""
      titulo="Assets de Todo"
      FiltrosComponent={FiltrosTodo}
    />
  );
}

export default AssetsTodo;
