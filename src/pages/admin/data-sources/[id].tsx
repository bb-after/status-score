import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import AddOrEditDataSource from "../../../components/AddOrEditDataSource";

const AdminEditDataSourcePage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      {id && typeof id === "string" && (
        <AddOrEditDataSource dataSourceId={id} />
      )}
    </>
  );
};

export default AdminEditDataSourcePage;
