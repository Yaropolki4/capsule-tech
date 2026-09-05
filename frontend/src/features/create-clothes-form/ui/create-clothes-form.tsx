import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ensureBrowserDecodableImage } from "@/shared/lib/image/heic";
import { CreateClothesFormImageStep } from "./create-clothes-form-image-step";
import { CreateClotherEditor } from "./create-clother-editor";

const STEPS_COUNT = 2;

function StepProgress({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex gap-1.5 px-1">
      {Array.from({ length: STEPS_COUNT }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 h-1 rounded-full",
            index <= activeStep ? "bg-primary" : "bg-secondary"
          )}
        />
      ))}
    </div>
  );
}

export function CreateClothesForm() {
  const [activeStep, setActiveStep] = useState(0);

  const [image, setImage] = useState<File | null>(null);
  const url = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  const header = (
    <DialogHeader className="mb-2">
      <DialogTitle>Добавление вещи</DialogTitle>
    </DialogHeader>
  );

  const getStepComponent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            {header}
            <div className="grow relative">
              <div className="w-full h-full absolute">
                <CreateClothesFormImageStep
                  onImageChange={async (image) => {
                    setImage(image ? await ensureBrowserDecodableImage(image) : image);
                    setActiveStep(1);
                  }}
                />
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <CreateClotherEditor
            url={url}
            image={image}
            onBackClick={() => setActiveStep(activeStep - 1)}
            setImage={setImage}
          />
        );
    }
  };

  return (
    <DialogContent className="flex flex-col gap-4 h-[600px] max-sm:h-[400px]">
      <StepProgress activeStep={activeStep} />
      {getStepComponent()}
    </DialogContent>
  );
}
