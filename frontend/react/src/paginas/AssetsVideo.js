import AssetsGenerico from './AssetsGenerico';
import FiltrosVideo from './components/filtros/FiltrosVideo';

function AssetsVideo() {
  return (
    <AssetsGenerico 
      categoria="Vídeo"
      titulo="Assets de Video"
      FiltrosComponent={FiltrosVideo}
    />
  );
}

export default AssetsVideo;