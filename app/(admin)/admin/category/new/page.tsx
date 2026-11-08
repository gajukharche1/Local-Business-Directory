import { redirect } from "next/navigation";

export default function SingularNewCategoryPage() {
  redirect("/admin/categories?action=new");
}

