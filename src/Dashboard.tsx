import {ProcessorStatistics} from "./types";

interface DashboardProps {
  statistics: ProcessorStatistics;
}

const Dashboard = ({ statistics }: DashboardProps) => {
  return (
    <div>
      {Array.from(statistics.entries()).map(([key, value], index) => (<p key={index}>{key}: {value}</p>))}
    </div>
  )
}

export default Dashboard;