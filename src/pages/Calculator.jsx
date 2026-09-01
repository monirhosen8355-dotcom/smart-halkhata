import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Calculator() {
  const navigate = useNavigate();
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  const buttons = [
    ["AC", "⌫", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["00", "0", ".", "="],
  ];

  const isOperator = (value) =>
    ["÷", "×", "−", "+"].includes(value);

  const calculate = () => {
    try {
      const safeExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

      if (!safeExpression) return;

      const result = Function(
        `"use strict"; return (${safeExpression})`
      )();

      if (!Number.isFinite(result)) {
        setDisplay("Error");
        setExpression("");
        return;
      }

      const formatted = Number.isInteger(result)
        ? String(result)
        : String(Number(result.toFixed(10)));

      setDisplay(formatted);
      setExpression(formatted);
    } catch {
      setDisplay("Error");
      setExpression("");
    }
  };

  const handleClick = (value) => {
    if (value === "AC") {
      setDisplay("0");
      setExpression("");
      return;
    }

    if (value === "⌫") {
      const next = expression.slice(0, -1);
      setExpression(next);
      setDisplay(next || "0");
      return;
    }

    if (value === "%") {
      if (!expression) return;

      try {
        const result = Function(
          `"use strict"; return (${expression}) / 100`
        )();

        const formatted = String(Number(result.toFixed(10)));
        setExpression(formatted);
        setDisplay(formatted);
      } catch {
        setDisplay("Error");
      }

      return;
    }

    if (value === "=") {
      calculate();
      return;
    }

    if (isOperator(value)) {
      if (!expression) {
        if (value === "−") {
          setExpression("−");
          setDisplay("−");
        }
        return;
      }

      if (isOperator(expression.slice(-1))) {
        const next = expression.slice(0, -1) + value;
        setExpression(next);
        setDisplay(next);
        return;
      }

      const next = expression + value;
      setExpression(next);
      setDisplay(next);
      return;
    }

    const next =
      expression === "0" || display === "Error"
        ? value
        : expression + value;

    setExpression(next);
    setDisplay(next);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "18px 14px 100px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--text)",
              fontSize: "25px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            ←
          </button>

          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              opacity: 0.55,
            }}
          >
            Smart-Halkhata
          </div>

          <div style={{ width: "38px" }} />
        </div>

        {/* Calculator */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border, #E5E7EB)",
            borderRadius: "24px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Display */}
          <div
            style={{
              minHeight: "125px",
              borderRadius: "18px",
              background: "var(--bg)",
              border: "1px solid var(--border, #E5E7EB)",
              padding: "18px",
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                textAlign: "right",
                fontSize: "13px",
                opacity: 0.45,
                minHeight: "20px",
                overflow: "hidden",
              }}
            >
              {expression}
            </div>

            <div
              style={{
                width: "100%",
                textAlign: "right",
                fontSize: "36px",
                fontWeight: "700",
                lineHeight: "1.2",
                marginTop: "6px",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {buttons.flat().map((value, index) => {
              const operator = isOperator(value);
              const special =
                ["AC", "⌫", "%"].includes(value);
              const equal = value === "=";

              return (
                <button
                  key={`${value}-${index}`}
                  type="button"
                  onClick={() => handleClick(value)}
                  style={{
                    height: "64px",
                    border: "none",
                    borderRadius: "16px",
                    background: equal
                      ? "#2563EB"
                      : operator
                      ? "rgba(37,99,235,0.10)"
                      : special
                      ? "rgba(107,114,128,0.10)"
                      : "var(--bg)",
                    color: equal
                      ? "#fff"
                      : operator
                      ? "#2563EB"
                      : "var(--text)",
                    fontSize: equal ? "24px" : "20px",
                    fontWeight:
                      equal || operator || special
                        ? "800"
                        : "700",
                    cursor: "pointer",
                    transition: "transform .08s ease",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.95)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator;