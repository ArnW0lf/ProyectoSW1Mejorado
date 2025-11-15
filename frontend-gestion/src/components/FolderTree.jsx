import React from 'react';
import { NavLink } from '@mantine/core';
import { IconFolder, IconFileText } from '@tabler/icons-react';

// (Los datos de prueba ahora están dentro del componente
// para que el mapeo sea más fácil de leer)

const FolderTree = () => {

  // Esta función se llamará cuando el usuario haga clic
  const handleClick = (label) => {
    console.log('Elemento seleccionado:', label);
    // Aquí filtrarías la lista de documentos
  };

  return (
    <>
      {/* Nivel Raíz */}
      <NavLink
        label="Documentos Principales"
        leftSection={<IconFolder size="1rem" />}
        childrenOffset={28}
        onClick={() => handleClick('Documentos Principales')}
      >
        {/* Hijos */}
        <NavLink 
          label="Contratos" 
          leftSection={<IconFolder size="1rem" />} 
          onClick={() => handleClick('Contratos')} 
        />
        <NavLink 
          label="Facturas" 
          leftSection={<IconFolder size="1rem" />} 
          onClick={() => handleClick('Facturas')} 
        />
      </NavLink>

      <NavLink
        label="informe_anual.pdf"
        leftSection={<IconFileText size="1rem" />}
        onClick={() => handleClick('informe_anual.pdf')}
      />

      <NavLink
        label="Proyectos"
        leftSection={<IconFolder size="1rem" />}
        childrenOffset={28}
        onClick={() => handleClick('Proyectos')}
      >
        {/* Hijos */}
        <NavLink 
          label="Proyecto Alpha" 
          leftSection={<IconFolder size="1rem" />} 
          onClick={() => handleClick('Proyecto Alpha')} 
        />
        <NavLink
          label="Proyecto Beta"
          leftSection={<IconFolder size="1rem" />}
          childrenOffset={28}
          onClick={() => handleClick('Proyecto Beta')}
        >
          {/* Hijos Nivel 3 */}
          <NavLink 
            label="Bocetos" 
            leftSection={<IconFolder size="1rem" />} 
            onClick={() => handleClick('Bocetos')} 
          />
          <NavLink 
            label="Entregables" 
            leftSection={<IconFolder size="1rem" />} 
            onClick={() => handleClick('Entregables')} 
          />
        </NavLink>
      </NavLink>

      <NavLink
        label="notas_rapidas.txt"
        leftSection={<IconFileText size="1rem" />}
        onClick={() => handleClick('notas_rapidas.txt')}
      />
    </>
  );
};

export default FolderTree;