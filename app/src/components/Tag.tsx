import { Tag as TagModel } from '@/model';

function Tag({ name, slug }: TagModel) {
  return (
    <span className="tag">
      <img
        src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
        alt={name}
      />
      {name}
    </span>
  );
}

export default Tag;
