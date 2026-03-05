import { useNavigate, useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ProcedureEditor } from '../procedure-editor/ProcedureEditor';

export function ProcedureEditorPage() {
  const navigate = useNavigate();
  const { procedureId } = useParams();

  return (
    <DndProvider backend={HTML5Backend}>
      <ProcedureEditor />
    </DndProvider>
  );
}
