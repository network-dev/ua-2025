import AssetsGenerico from './AssetsGenerico';
import FiltrosScripts from './components/filtros/FiltrosScript';

function AssetsScripts() {
  return (
    <AssetsGenerico 
      categoria="Scripts"
      titulo="Scripts"
      FiltrosComponent={FiltrosScripts}
    />
  );
}

export default AssetsScripts;