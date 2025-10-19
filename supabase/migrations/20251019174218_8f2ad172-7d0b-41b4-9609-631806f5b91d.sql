-- Allow admins to manage VODs
CREATE POLICY "Admins can insert VODs"
ON public.vods
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update VODs"
ON public.vods
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete VODs"
ON public.vods
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));