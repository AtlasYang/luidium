"use client";

import { Grid } from "react-loader-spinner";

export default function GridLoaderIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Grid
      visible={true}
      height={size}
      width={size}
      color={color}
      ariaLabel="grid-loading"
      radius="12.5"
      wrapperStyle={{}}
      wrapperClass="grid-wrapper"
    />
  );
}
