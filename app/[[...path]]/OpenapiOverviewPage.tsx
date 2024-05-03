"use client";

import { notEmpty, onlyUnique2 } from "from-anywhere";
import revalidateOpenapi from "./revalidateOpenapi";
import { OpenAPIV3 } from "openapi-types";
import { MatchingText, OpenapiDetails } from "openapi-for-humans-react";
import { useState } from "react";
import Markdown from "react-markdown";

export const OpenapiOverviewPage = (props: {
  openapiDetails: OpenapiDetails;
}) => {
  const { openapiDetails } = props;

  const [search, setSearch] = useState("");

  const links = [
    {
      title: "Swagger",
      url: `https://petstore.swagger.io/?url=${openapiDetails.openapiUrl}`,
    },
    {
      title: "Swagger Editor",
      url: `https://editor.swagger.io/?url=${openapiDetails.openapiUrl}`,
    },
    {
      title: "OpenAPI GUI",
      url: `https://mermade.github.io/openapi-gui/?url=${openapiDetails.openapiUrl}`,
    },
    {
      title: "Stoplight",
      url: `https://elements-demo.stoplight.io/?spec=${openapiDetails.openapiUrl}`,
    },

    {
      title: "ActionSchema Combination Proxy",
      url: `https://proxy.actionschema.com/?url=${openapiDetails.openapiUrl}`,
    },

    {
      title: "Source",
      url: openapiDetails.openapiUrl,
    },
  ];

  const tags = openapiDetails.document.tags?.length
    ? openapiDetails.document.tags
    : openapiDetails.operations
        .map((item) => item.operation.tags)
        .filter(notEmpty)
        .flat()
        .filter(onlyUnique2())
        .map((name) => ({ name } as OpenAPIV3.TagObject));

  return (
    <div className="p-20">
      <h1 className="text-3xl">{openapiDetails.document.info?.title}</h1>

      <div className="flex flex-row flex-wrap">
        {links.map((link) => {
          return (
            <a
              className="pr-6 text-blue-500 hover:text-blue-600"
              href={link.url}
              key={link.url}
            >
              {link.title}
            </a>
          );
        })}
        <button
          onClick={() => {
            revalidateOpenapi(openapiDetails.openapiUrl);
          }}
        >
          Refresh
        </button>
      </div>

      <input
        type="text"
        placeholder="Search"
        className="p-2 m-2  bg-transparent"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div>
        <ul>
          {tags
            .concat({ name: "__undefined", description: "No tags present" })
            .map((tag) => {
              const description = tag.description
                ? `: ${tag.description}`
                : tag.externalDocs
                ? `: ${tag.externalDocs.url}`
                : "";

              const filtered = openapiDetails.operations
                .filter((x) =>
                  tag.name === "__undefined"
                    ? !x.operation.tags?.length
                    : x.operation.tags?.includes(tag.name),
                )
                .filter(
                  (item) =>
                    !search ||
                    search.trim() === "" ||
                    item.id.toLowerCase().includes(search.toLowerCase()) ||
                    item.operation.summary
                      ?.toLowerCase()
                      .includes(search.toLowerCase()),
                );
              return filtered.length === 0 ? null : (
                <li
                  className={
                    tag.name === "__undefined"
                      ? undefined
                      : "list-disc list-inside"
                  }
                  key={`tag${tag.name}`}
                >
                  {tag.name === "__undefined" ? null : (
                    <div>
                      <b>{tag.name}</b>
                      {description}
                    </div>
                  )}

                  <ul>
                    {filtered.map((item) => {
                      return (
                        <li
                          className="ml-10 list-disc list-inside"
                          key={`item${tag.name}-${item.operation.operationId}`}
                        >
                          <a href={`/${openapiDetails.openapiId}/${item.id}`}>
                            <MatchingText
                              search={search || ""}
                              text={`${item.id} - ${item.operation.summary}`}
                              defaultTextClassName=""
                              matchTextClassName="text-blue-500"
                            />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
        </ul>
      </div>

      <div className="my-10">
        <Markdown>{openapiDetails.document.info.description}</Markdown>
      </div>
    </div>
  );
};
