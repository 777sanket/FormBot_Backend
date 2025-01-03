import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormResponses } from "../../services/responseApi";
import WorkSpaceNav from "../../components/WorkSpaceNav/WorkSpaceNav";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import styles from "./response.module.css";

// Register components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResponsePage() {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allKeys, setAllKeys] = useState([]); // To store all unique keys across responses
  const [viewCount, setViewCount] = useState(0);
  const [startCount, setStartCount] = useState(0);
  const [completionCount, setCompletionCount] = useState(0);

  useEffect(() => {
    const loadResponses = async () => {
      setIsLoading(true);
      try {
        const responseData = await getFormResponses(formId);
        setResponses(responseData);

        // Fetch and set view, start, and completion counts
        setViewCount(responseData.viewCount || 0);
        setStartCount(responseData.startCount || 0);
        setCompletionCount(responseData.completionCount || 0);

        const keys = new Set();
        responseData.responses.forEach((response) => {
          Object.keys(response).forEach((key) => keys.add(key));
        });
        setAllKeys(Array.from(keys));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading responses:", error);
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [formId]);

  const completionRate = Math.round(
    (completionCount / (startCount || 1)) * 100
  );

  const data = {
    datasets: [
      {
        data: [completionCount, startCount - completionCount],
        backgroundColor: ["#4CAF50", "#D3D3D3"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading responses...</div>;
  }

  return (
    <div className={styles.responseContainer}>
      <div className={styles.workspaceNav}>
        <WorkSpaceNav />
      </div>

      {/* Display view and start count */}
      <div className={styles.statsContainer}>
        <p>View Count: {viewCount}</p>
        <p>Start Count: {startCount}</p>
      </div>

      {/* Completion Chart */}
      <div className={styles.chartContainer}>
        <div style={{ position: "relative", width: "300px", height: "300px" }}>
          <Doughnut data={data} options={options} />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>
              {completionRate}%
            </p>
            <p style={{ margin: 0, color: "#555" }}>Completion</p>
          </div>
        </div>
      </div>

      <div className={styles.responseTableContainer}>
        <div>
          <table className={styles.responseTable}>
            <thead>
              <tr>
                {allKeys.map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((response, index) => (
                <tr key={index}>
                  {allKeys.map((key, keyIndex) => (
                    <td key={keyIndex}>
                      {key.startsWith("Label") &&
                      response[key] &&
                      response[key].startsWith("http") ? (
                        <img
                          src={response[key]}
                          alt="Label content"
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      ) : (
                        response[key] || "N/A"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
