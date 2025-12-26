import React from 'react';

interface ProjectSelectSectionProps {
  projectId: string;
  projects: any[];
  onProjectChange: (projectId: string) => void;
  fieldBase: string;
  labelBase: string;
  sectionCard: string;
  NEON: string;
}

const ProjectSelectSection: React.FC<ProjectSelectSectionProps> = ({
  projectId,
  projects,
  onProjectChange,
  fieldBase,
  labelBase,
  sectionCard,
  NEON,
}) => {
  return (
    <div className={sectionCard} style={{ borderColor: NEON }}>
      <label className={labelBase}>Obra (Opcional)</label>
      <select
        value={projectId}
        onChange={(e) => onProjectChange(e.target.value)}
        className={fieldBase}
      >
        <option value="">Sin obra asignada</option>
        {Array.isArray(projects) && projects.map((project: any) => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelectSection;
