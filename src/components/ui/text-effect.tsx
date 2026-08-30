"use client";

import { motion, Variants } from "framer-motion";
import React from "react";

interface TextEffectProps {
  children: React.ReactNode;
  per?: "char" | "word";
  preset?: "fade" | "blur" | "slide";
}

export function TextEffect({ children, per = "char", preset = "fade" }: TextEffectProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: per === "char" ? 0.03 : 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const renderText = (text: string, keyPrefix: string) => {
    const items = per === "char" ? text.split("") : text.split(" ");
    return items.map((char, index) => (
      <motion.span key={`${keyPrefix}-${index}`} variants={item} className="inline-block whitespace-pre">
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));
  };

  const renderChildren = (node: React.ReactNode, keyPrefix = "0"): React.ReactNode => {
    if (typeof node === "string") {
      return renderText(node, keyPrefix);
    }
    
    if (Array.isArray(node)) {
      return node.map((child, index) => renderChildren(child, `${keyPrefix}-${index}`));
    }
    
    if (React.isValidElement(node)) {
      if (node.type === "br") {
        return <br key={keyPrefix} />;
      }
      return <motion.span key={keyPrefix} variants={item} className="inline-block">{node}</motion.span>;
    }
    
    return node;
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="show"
      className="inline-block"
    >
      {renderChildren(children)}
    </motion.span>
  );
}
