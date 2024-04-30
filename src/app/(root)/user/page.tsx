import { Suspense } from "react";
import User from "./client"

export default function Page() {
  
  return (
    <Suspense>
      <User />
    </Suspense>
  )
}
