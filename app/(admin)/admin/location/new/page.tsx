import { redirect } from "next/navigation";

export default function SingularNewLocationPage() {
  redirect("/admin/locations?action=new");
}

