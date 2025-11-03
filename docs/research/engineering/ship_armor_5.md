---
title: "Neutronium Materials"
description: "This incredibly dense and strong material can resist firepower that would turn armor made of any other alloys into slag."
sidebar_label: "Neutronium Materials"
tags: []
---

# Neutronium Materials

## Overview

This incredibly dense and strong material can resist firepower that would turn armor made of any other alloys into slag.

## Research Details

<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-label">Research Area</div>
    <div className="stat-value">engineering</div>
  </div>
  <div className="stat-card">
    <div className="stat-label">Tier</div>
    <div className="stat-value">4</div>
  </div>
  <div className="stat-card">
    <div className="stat-label">Base Cost</div>
    <div className="stat-value">0</div>
  </div>
  <div className="stat-card">
    <div className="stat-label">Weight</div>
    <div className="stat-value">0</div>
  </div>
</div>

## Prerequisites

:::info Required Technologies
The following technologies must be researched before this technology becomes available:

- Technology A
- Technology B
- Technology C
:::

## Effects

This technology provides the following bonuses:

- **Effect Type 1**: +10% bonus
- **Effect Type 2**: -5% penalty reduction
- **Effect Type 3**: Unlocks new feature

## Notes

Additional information and tips about this technology can be added here.

---

<details>
<summary>View Raw Data</summary>

```json
{
  "area": "engineering",
  "category": "materials",
  "cost": 0,
  "description": "This incredibly dense and strong material can resist firepower that would turn armor made of any other alloys into slag.",
  "icon": "tech_ship_armor_5",
  "isDangerous": false,
  "isEvent": false,
  "isGestalt": false,
  "isMegacorp": false,
  "isRare": false,
  "isRepeatable": false,
  "isReverse": false,
  "isStartTech": false,
  "key": "tech_ship_armor_5",
  "level": 4,
  "levels": 0,
  "name": "Neutronium Materials",
  "prerequisites": [
    "tech_ship_armor_4"
  ],
  "sourceFile": "00_eng_tech.txt",
  "tier": 4,
  "weight": 0
}
```

</details>

<style jsx>{`
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  .stat-card {
    background: var(--ifm-background-surface-color);
    border: 1px solid var(--ifm-color-emphasis-300);
    border-radius: 8px;
    padding: 1.25rem;
    transition: all 0.2s ease;
  }

  [data-theme='dark'] .stat-card {
    border-color: rgba(0, 212, 255, 0.2);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  [data-theme='dark'] .stat-card:hover {
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
  }

  .stat-label {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ifm-color-emphasis-600);
    margin-bottom: 0.5rem;
  }

  [data-theme='dark'] .stat-label {
    color: #8fa3b8;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ifm-color-primary);
    line-height: 1.2;
  }
`}</style>

