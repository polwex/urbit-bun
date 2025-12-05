import { useEffect, useRef } from "react";
import React, { Component } from "react";
import type { UrbitWallet } from "urbit-key-generation";
import { CANVAS_SIZE, extendWallet, generatePng, merge } from ".";
import templates from "./templates.json";
import { initCanvas } from "./utils";

interface PaperWalletProps {
  wallet: UrbitWallet;
  output: "png" | "uri";
  callback: (data: any) => any;
  className?: string;
  style?: React.CSSProperties;
}

export default function PaperWallet({ wallet, ...props }: PaperWalletProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    run();
  }, [wallet, canvasRef.current]);
  async function run() {
    if (!canvasRef.current) return;
    const cv = initCanvas(canvasRef.current, CANVAS_SIZE, 4);
    const ew = await extendWallet(wallet);
    const merged: any = merge({ wallet: ew, templates: templates.frames });
    const output = generatePng(cv, merged, false, props.output);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
    props.callback(output);
  }

  return (
    <canvas className={props.className} style={props.style} ref={canvasRef} />
  );
}
