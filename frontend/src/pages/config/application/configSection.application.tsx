import { getRouteApi } from '@tanstack/react-router';
import BusinessApplication from '@/pages/config/application/business/business.application';
import DoctorsApplication from '@/pages/config/application/doctors/doctors.application';

const routeApi = getRouteApi('/config/$section');

const ConfigSectionApplication = () => {
  const { section } = routeApi.useParams();
  switch (section) {
    case "business":
      return <BusinessApplication />
    case "doctors":
      return <DoctorsApplication />
    default:
      return null
  }
};

export default ConfigSectionApplication;
