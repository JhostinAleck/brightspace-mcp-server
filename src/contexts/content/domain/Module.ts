import type { Topic } from './Topic.js';

export interface ModuleProps {
  id: number;
  title: string;
  topics: Topic[];
  submodules: Module[];
}

export class Module {
  constructor(private readonly props: ModuleProps) {}
  get id(): number { return this.props.id; }
  get title(): string { return this.props.title; }
  get topics(): readonly Topic[] { return this.props.topics; }
  get submodules(): readonly Module[] { return this.props.submodules; }
}
