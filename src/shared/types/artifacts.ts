export interface ArtifactProvenance {
  workflowId?: string
  workflowNodeId?: string
  source?: string
  [key: string]: unknown
}

export interface ArtifactRef {
  artifactId?: string
  versionId?: string
  provenance?: ArtifactProvenance
}
