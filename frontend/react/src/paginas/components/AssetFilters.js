// AssetFilters.js
import Filtros3D from './filtros/Filtros3D';
import Filtros2D from './filtros/Filtros2D';
import FiltrosSonido from './filtros/FiltrosSonido';
import FiltrosVideo from './filtros/FiltrosVideo';
import FiltrosScripts from './filtros/FiltrosScripts';
import FiltrosTodo from './filtros/FiltrosTodo';

function AssetFilters({ tipo }) {
  switch (tipo) {
    case '3d':
      return <Filtros3D />;
    case '2d':
      return <Filtros2D />;
    case 'sonido':
      return <FiltrosSonido />;
    case 'vídeo':
      return <FiltrosVideo />;
    case 'scripts':
      return <FiltrosScripts />;
    case 'todo':
      return <FiltrosTodo />;
    default:
      return null;
  }
}

export default AssetFilters;
