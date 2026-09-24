import { getRouteApi } from '@tanstack/react-router';
import DoctorsApplication from '@/pages/config/application/doctors/doctors.application';

const routeApi = getRouteApi('/config/$section');

const ConfigSectionApplication = () => {
  const { section } = routeApi.useParams();
  switch (section) {
    case "doctors":
      return <DoctorsApplication />
    default:
      return null
  }
};

export default ConfigSectionApplication;
