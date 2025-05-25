import { ArrowLeft, ArrowRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

    const renderPages = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        if (endPage - startPage < 4) {
            if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
            } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
            <button
                key={i}
                onClick={() => onPageChange(i)}
                style={{
                marginTop: '3rem',
                backgroundColor: currentPage === i ? 'var(--primary)' : 'transparent',
                color: currentPage === i ? 'var(--text-button)' : 'var(--secondary)',
                border: currentPage === i ? '0 none transparent' : '2px solid var(--secondary)',
                }}
            >
                {i}
            </button>
            );
        }
        
        return pages;
    };

  return (
    <div style={{width: '100%', display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '3rem'}}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        style={{display: 'flex', justifyContent: 'center', alignItems: "center", gap: '0.4rem', marginTop: '3rem', 
                backgroundColor: 'transparent', color: 'var(--secondary)', border: '2px solid var(--secondary)'}}
      >
        <ArrowLeft /> Anterior
      </button>
      {renderPages()}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}ç
        style={{display: 'flex', justifyContent: 'center', alignItems: "center", gap: '0.4rem', marginTop: '3rem', backgroundColor: 'transparent', color: 'var(--secondary)', border: '2px solid var(--secondary)'}}
      >
        Siguiente <ArrowRight />
      </button>
    </div>
  );
};

export default Pagination;
