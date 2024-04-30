import { MetaPagination } from "~/types";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

const PaginationComponent = ({
  data,
  path,
  query
}: {
  data: MetaPagination;
  query: string;
  path: string;
}) => {
  if (!data.pageCount) return null;

  // 페이지 번호들을 생성하는 함수
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage, endPage;

    if (data.pageCount <= 10) {
      // Tampilkan semua nomor halaman jika jumlah halaman total 10 atau kurang
      startPage = 1;
      endPage = data.pageCount;
    } else {
      // Jika halaman saat ini kurang dari 6, maka 10 halaman dari awal.
      if (data.currentPage < 6) {
        startPage = 1;
        endPage = 10;
      } else if (data.currentPage + 4 >= data.pageCount) {
        startPage = data.pageCount - 9;
        endPage = data.pageCount;
      } else {
        startPage = data.currentPage - 5;
        endPage = data.currentPage + 4;
      }
    }

    // 시작 페이지부터 끝 페이지까지를 배열에 추가
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {data.previousPage && (
          <PaginationItem>
            <PaginationPrevious href={!!query ?`${path}?q=${query}&page=${data.previousPage}` :`${path}?page=${data.previousPage}`} />
          </PaginationItem>
        )}
        {pageNumbers.map((number, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href={!!query ?`${path}?q=${query}&page=${data.previousPage}` :`${path}?page=${data.previousPage}`}
              isActive={data.currentPage === number}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        {data.pageCount > 10 && data.currentPage < data.pageCount - 4 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {data.pageCount > 10 && (
          <PaginationItem>
            <PaginationLink
              href={!!query ?`${path}&page=${data.previousPage}` :`${path}?page=${data.previousPage}`}
              isActive={data.currentPage === data.pageCount}
            >
              {data.pageCount}
            </PaginationLink>
          </PaginationItem>
        )}
          {data.nextPage && (
          <PaginationItem>
            <PaginationNext href={!!query ?`${path}?q=${query}&page=${data.nextPage}` :`${path}?page=${data.nextPage}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
