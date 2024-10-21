"use client";

import { Box, Pagination, Loader } from "@cruk/cruk-react-components";
import { NasaResponse, NasaSearchParams } from "../types";
import { nasaMediaApi, urlNasaSearch } from "../services/nasa";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";

import { useEffect, useMemo, useState } from "react";

export function List({ values }: { values: NasaSearchParams }) {
  const urlNasaSearchUrl = values
    ? urlNasaSearch(values as NasaSearchParams)
    : "";

  // Will default to page 1 when the search params changes
  useEffect(() => {
    setPage(1);
  }, [values]);

  // Fetch the list of NASA items
  const { data: nasaData } = useQuery<NasaResponse>(
    ["nasaSearch", values],
    () => fetch(urlNasaSearchUrl).then((res) => res.json()),
    { enabled: !!urlNasaSearchUrl.length }
  );

  // Adds index to each Nasa item
  const nasaDataWithIndex = useMemo(() => {
    return (
      nasaData?.collection?.items?.map((item, index) => ({
        ...item,
        index,
      })) || []
    );
  }, [nasaData]);

  //Loops through nasa item to fetch media from asset api
  const mediaApiQuery = useQueries({
    queries:
      nasaData?.collection?.items?.map((item) => {
        const nasaId = item.data[0]?.nasa_id;
        return {
          queryKey: ["nasaMedia", nasaId],
          queryFn: () =>
            fetch(nasaMediaApi(nasaId ?? "")).then((res) => res.json()),
          enabled: !!urlNasaSearchUrl.length,
        };
      }) || [],
  });

  // Pagination Logic
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Calculates the total number of pages needed to display all items.
  const pages = Math.ceil(
    nasaData?.collection?.items?.length || 0 / rowsPerPage
  );

  // Return the sliced array of items for the current page, or an empty array if undefined
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return nasaDataWithIndex?.slice(start, end) || [];
  }, [page, nasaDataWithIndex]);

  return (
    <>
      {!!nasaData ? (
        <Box>
          <Table
            bottomContent={
              <div>
                <Pagination
                  color="secondary"
                  current={page}
                  items={pages}
                  pagerCallback={(page) => setPage(page)}
                  perPage={10}
                />
              </div>
            }
            style={{ width: "100%" }} // Ensure table takes full width and cells are fixed
          >
            <TableHeader className="overflow-wrap: break-word">
              <TableColumn key="title">Title</TableColumn>
              <TableColumn key="media_type">Media Type</TableColumn>
              <TableColumn key="nasa_id">Media ID</TableColumn>
              <TableColumn key="mediaContent">Media</TableColumn>
            </TableHeader>
            <TableBody items={items}>
              {(item) => {
                return (
                  <TableRow key={item?.data[0]?.nasa_id}>
                    {(columnKey) => {
                      // Checks if the media is loading or if there is no media available
                      if (columnKey === "mediaContent") {
                        if (mediaApiQuery[item?.index]?.isLoading) {
                          return <TableCell>Loading...</TableCell>;
                        } else if (
                          !mediaApiQuery[item?.index]?.data?.collection
                            ?.items[0]?.href
                        ) {
                          return <TableCell>No media available</TableCell>;
                          // If there is media available, it will return the media type with the media url
                        } else {
                          const media = mediaApiQuery[item?.index]?.data;
                          const mediaType = item.data[0]?.media_type;
                          const mediaUrl = media?.collection?.items[0]?.href;

                          if (mediaType === "image") {
                            return (
                              <TableCell>
                                <img
                                  src={mediaUrl}
                                  alt="Media"
                                  style={{ width: "200px", height: "200px" }}
                                />
                              </TableCell>
                            );
                          } else if (mediaType === "video") {
                            return (
                              <TableCell>
                                <video width="200" controls>
                                  <source src={mediaUrl} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </TableCell>
                            );
                          } else if (mediaType === "audio") {
                            return (
                              <TableCell>
                                <audio controls>
                                  <source src={mediaUrl} type="audio/mpeg" />
                                  Your browser does not support the audio
                                  element.
                                </audio>
                              </TableCell>
                            );
                          }
                        }
                      }
                      // The rest of the columns will return the data from the nasa response
                      return (
                        <TableCell
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {getKeyValue(item.data[0], columnKey)}
                        </TableCell>
                      );
                    }}
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Loader />
      )}
    </>
  );
}
