import {
  OperationPage,
  OpenapiOverviewPage,
  getOpenapisOperations,
  getOpenapiOperations,
} from "openapi-for-humans-react";
import { OpenapiOperationObject, fetchOpenapi, notEmpty } from "from-anywhere";
import { Metadata, ResolvingMetadata } from "next";
import { tryParseUrlFromId } from "./tryParseUrlFromId";
import { openapiUrlObject } from "../openapiUrlObject";
import { selectedIds } from "../selectedIds";
import { generateStaticParamsForOperations } from "../generateStaticParamsForOperations";
import { Homepage } from "./Homepage";
import { NextOperationPage } from "./NextOperationPage";

type HomepageProps = {
  params?: { path: PathParam };
  searchParams: { query?: string };
};

/**
 * See: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  props: HomepageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { params, searchParams } = props;
  const openapiId = params?.path?.[0];
  const operationId = params?.path?.[1];
  //console.log({ rest, searchParams, openapiId, operationId });
  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: operationId
      ? `${openapiId} - ${operationId}`
      : openapiId
      ? openapiId
      : "OpenAPI for Humans",
    description:
      "OpenAPI for Humans combines multiple OpenAPIs in a fast, organized, and searchable interface.",
    // openGraph: {
    //   images: ["/some-specific-page-image.jpg", ...previousImages],
    // },
  };
}

/**
 * https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
 */
export const dynamicParams = true;

/**
 * NB: openapi must be defined to show this page (otherwise, homepage is shown)
 *
 * However, the operation need not be defined, and can be undefined.
 */
type PathParam = [string | undefined, string | undefined];

/**
 * https://nextjs.org/docs/app/api-reference/functions/generate-static-params#generate-only-a-subset-of-params
 */
export const generateStaticParams = generateStaticParamsForOperations;

const Pathpage = async (props: HomepageProps) => {
  const openapiId = props?.params?.path?.[0];
  const operationId = props?.params?.path?.[1];
  const openapiUrl =
    openapiId && Object.keys(openapiUrlObject).includes(openapiId)
      ? openapiUrlObject[openapiId as keyof typeof openapiUrlObject]
      : tryParseUrlFromId(openapiId);

  if (!openapiId || !openapiUrl) {
    return <Homepage />;
  }

  const openapiDetails =
    openapiId && openapiUrl
      ? await getOpenapiOperations(openapiId, openapiUrl)
      : undefined;

  const operationDetails = operationId
    ? openapiDetails?.operations?.find((x) => x.id === operationId)
    : undefined;

  return (
    <div>
      {openapiDetails ? (
        operationDetails ? (
          <NextOperationPage operationDetails={operationDetails} />
        ) : (
          <OpenapiOverviewPage openapiDetails={openapiDetails} />
        )
      ) : (
        <div>
          No openapi found even though it should be available. Likely fetch
          failed?
        </div>
      )}
    </div>
  );
};

export default Pathpage;
