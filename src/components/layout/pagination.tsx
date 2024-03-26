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
}: {
  data: MetaPagination;
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
        // 현재 페이지가 마지막에서 5번째 이전 페이지보다 크거나 같으면 마지막 10개 페이지
        startPage = data.pageCount - 9;
        endPage = data.pageCount;
      } else {
        // 그 외의 경우 현재 페이지를 중심으로 앞뒤로 4개씩
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
            <PaginationPrevious href={`${path}?page=${data.previousPage}`} />
          </PaginationItem>
        )}
        {pageNumbers.map((number, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href={`${path}?page=${number}`}
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
              href={`${path}?page=${data.pageCount}`}
              isActive={data.currentPage === data.pageCount}
            >
              {data.pageCount}
            </PaginationLink>
          </PaginationItem>
        )}
          {data.nextPage && (
          <PaginationItem>
            <PaginationNext href={`${path}?page=${data.nextPage}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
